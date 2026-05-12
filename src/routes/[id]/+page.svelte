<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ConfirmModal from '$lib/components/ui/confirm-modal.svelte';
	import DashboardError from './_components/dashboard-error.svelte';
	import DashboardLoading from './_components/dashboard-loading.svelte';
	import DashboardToolbar from './_components/dashboard-toolbar.svelte';
	import EmptyTasksState from './_components/empty-tasks-state.svelte';
	import NoMatchesState from './_components/no-matches-state.svelte';
	import TaskBoardView from './_components/task-board-view.svelte';
	import TaskFiltersPanel from './_components/task-filters-panel.svelte';
	import TaskFormModal from './_components/task-form-modal.svelte';
	import TaskListView from './_components/task-list-view.svelte';
	import TaskTimeModal from './_components/task-time-modal.svelte';
	import { getErrorMessage } from '$lib/errors';
	import {
		addLabelToTask,
		createTask,
		deleteTask,
		fetchDashboardData,
		fetchProjectTasks,
		removeLabelFromTask,
		updateTask
	} from '$lib/task-api';
	import { STATUS_OPTIONS } from '$lib/task-status';
	import { toast } from '$lib/toast.svelte';
	import { buildFilterSearch, filtersMatchUrl } from './dashboard-url';
	import BulkActionBar from './_components/bulk-action-bar.svelte';

	let { data } = $props();
	const initialTasks = () => data.tasks ?? [];
	const initialUsers = () => data.users ?? [];
	const initialProjects = () => data.projects ?? [];

	let loading = $state(false);
	let refreshing = $state(false);
	let submitting = $state(false);
	let deletePending = $state(false);
	let bootError = $state('');

	let tasks = $state.raw([]);
	let users = $state.raw([]);
	let projects = $state.raw([]);
	let labels = $state.raw([]);

	$effect.pre(() => {
		tasks = data.tasks ?? [];
		users = data.users ?? [];
		projects = data.projects ?? [];
		labels = data.labels ?? [];
	});

	let searchQuery = $state('');
	let assigneeFilter = $state('all');
	let labelFilter = $state([]);
	let viewMode = $state('list');
	let sortField = $state('created_at');
	let sortDir = $state('desc');
	let selectedIds = $state(new Set());

	$effect.pre(() => {
		searchQuery = data.filters.q;
		assigneeFilter = data.filters.assignee;
	});

	$effect(() => {
		const q = searchQuery;
		const a = assigneeFilter;
		const url = page.url;

		if (filtersMatchUrl(q, a, url)) return;

		const search = buildFilterSearch(url, q, a);
		const pathname = `/${page.params.id}${search ? `?${search}` : ''}`;

		goto(resolve(pathname), { replaceState: true, keepFocus: true, noScroll: true });
	});

	let taskModalOpen = $state(false);
	let taskModalMode = $state('create');
	let activeTask = $state(null);
	let taskSubmitError = $state('');

	let timeModalOpen = $state(false);
	let activeTimeTask = $state(null);

	let deleteModalOpen = $state(false);
	let taskToDelete = $state(null);

	let projectId = $derived(page.params.id);

	let tasksForList = $derived.by(() => tasks);

	let filteredTasks = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();

		return tasksForList.filter((task) => {
			const matchesQuery =
				!query ||
				task.title?.toLowerCase().includes(query) ||
				task.description?.toLowerCase().includes(query);
			const matchesAssignee =
				assigneeFilter === 'all' || String(task.assigned_user_id ?? '') === assigneeFilter;
			const matchesLabels =
				labelFilter.length === 0 ||
				labelFilter.every((lid) => (task.labels ?? []).some((l) => l.id === lid));

			return matchesQuery && matchesAssignee && matchesLabels;
		});
	});

	let sortedTasks = $derived.by(() => {
		const arr = [...filteredTasks];
		const dir = sortDir === 'asc' ? 1 : -1;
		return arr.sort((a, b) => {
			if (sortField === 'title') {
				return dir * (a.title ?? '').localeCompare(b.title ?? '', 'pl');
			}
			if (sortField === 'status') {
				const order = { todo: 0, in_progress: 1, done: 2 };
				return dir * ((order[a.status] ?? 0) - (order[b.status] ?? 0));
			}
			if (sortField === 'due_date') {
				const da = a.due_date ? a.due_date : '';
				const db = b.due_date ? b.due_date : '';
				if (!da && !db) return 0;
				if (!da) return 1;
				if (!db) return -1;
				return dir * da.localeCompare(db);
			}
			if (sortField === 'logged_hours') {
				return dir * ((Number(a.logged_hours) || 0) - (Number(b.logged_hours) || 0));
			}
			// default: created_at
			return dir * (a.id - b.id);
		});
	});

	let hasActiveFilters = $derived(
		Boolean(searchQuery.trim() || assigneeFilter !== 'all' || labelFilter.length > 0)
	);

	let boardColumns = $derived.by(() =>
		STATUS_OPTIONS.map((option) => ({
			...option,
			tasks: sortedTasks.filter((task) => task.status === option.value)
		}))
	);

	function handleSort(field) {
		if (sortField === field) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDir = 'asc';
		}
	}

	function toggleSelect(taskId) {
		const next = new Set(selectedIds);
		if (next.has(taskId)) next.delete(taskId);
		else next.add(taskId);
		selectedIds = next;
	}

	function toggleSelectAll() {
		if (selectedIds.size === sortedTasks.length) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(sortedTasks.map((t) => t.id));
		}
	}

	function clearSelection() {
		selectedIds = new Set();
	}

	async function loadDashboard({ silent = false } = {}) {
		if (silent) {
			refreshing = true;
		} else {
			loading = true;
			bootError = '';
		}

		try {
			const dashboardData = await fetchDashboardData();
			const projectTasks = await fetchProjectTasks(Number(projectId));

			tasks = projectTasks;
			users = dashboardData.users;
			projects = dashboardData.projects;
			labels = dashboardData.labels ?? [];
			bootError = '';
		} catch (error) {
			const message = getErrorMessage(error);
			if (silent && tasksForList.length > 0) {
				toast({
					title: 'Odświeżanie nie powiodło się',
					description: message,
					variant: 'destructive'
				});
			} else {
				bootError = message;
			}
		} finally {
			loading = false;
			refreshing = false;
		}
	}

	function clearFilters() {
		searchQuery = '';
		assigneeFilter = 'all';
		labelFilter = [];
		clearSelection();
	}

	function openCreateTask() {
		taskModalMode = 'create';
		activeTask = null;
		taskSubmitError = '';
		taskModalOpen = true;
	}

	function openEditTask(task) {
		taskModalMode = 'edit';
		activeTask = task;
		taskSubmitError = '';
		taskModalOpen = true;
	}

	function closeTaskModal() {
		taskModalOpen = false;
		taskSubmitError = '';
		activeTask = null;
	}

	function openTimeModal(task) {
		activeTimeTask = task;
		timeModalOpen = true;
	}

	function closeTimeModal() {
		timeModalOpen = false;
		activeTimeTask = null;
	}

	async function handleTaskSubmit(payload) {
		submitting = true;
		taskSubmitError = '';

		try {
			if (taskModalMode === 'create') {
				await createTask({
					...payload,
					project_id: Number(projectId)
				});
			} else {
				await updateTask(activeTask.id, payload);
			}

			await loadDashboard({ silent: true });
			closeTaskModal();

			toast({
				title: taskModalMode === 'create' ? 'Utworzono zadanie' : 'Zaktualizowano zadanie',
				description:
					taskModalMode === 'create'
						? 'Nowe zadanie zostało zapisane w systemie.'
						: 'Zmiany zadania są widoczne na liście.',
				variant: 'success'
			});
		} catch (error) {
			taskSubmitError = getErrorMessage(error);
		} finally {
			submitting = false;
		}
	}

	function promptDeleteTask(task) {
		taskToDelete = task;
		deleteModalOpen = true;
	}

	function closeDeleteModal() {
		deleteModalOpen = false;
		taskToDelete = null;
	}

	async function handleDeleteTask() {
		if (!taskToDelete) return;

		deletePending = true;

		try {
			await deleteTask(taskToDelete.id);
			await loadDashboard({ silent: true });
			closeDeleteModal();

			toast({
				title: 'Usunięto zadanie',
				description: 'Zadanie zostało usunięte z systemu i z listy.',
				variant: 'success'
			});
		} catch (error) {
			toast({
				title: 'Usuwanie nie powiodło się',
				description: getErrorMessage(error),
				variant: 'destructive'
			});
		} finally {
			deletePending = false;
		}
	}
	async function handleToggleLabel(label) {
		if (!activeTask) return;
		const assigned = (activeTask.labels ?? []).some((l) => l.id === label.id);
		try {
			if (assigned) {
				await removeLabelFromTask(activeTask.id, label.id);
			} else {
				await addLabelToTask(activeTask.id, label.id);
			}
			await loadDashboard({ silent: true });
			activeTask = tasks.find((t) => t.id === activeTask.id) ?? activeTask;
		} catch (error) {
			toast({
				title: 'Błąd etykiety',
				description: getErrorMessage(error),
				variant: 'destructive'
			});
		}
	}

	async function handleBulkStatusChange(status) {
		const ids = [...selectedIds];
		if (ids.length === 0) return;
		try {
			await Promise.all(
				ids.map((id) => {
					const task = tasks.find((t) => t.id === id);
					if (!task) return Promise.resolve();
					return updateTask(id, {
						title: task.title,
						description: task.description,
						status,
						due_date: task.due_date,
						assigned_user_id: task.assigned_user_id,
						project_id: task.project_id,
						estimated_hours: task.estimated_hours
					});
				})
			);
			await loadDashboard({ silent: true });
			clearSelection();
			toast({ title: `Zmieniono status ${ids.length} zadań`, variant: 'success' });
		} catch (error) {
			toast({ title: 'Błąd', description: getErrorMessage(error), variant: 'destructive' });
		}
	}

	let taskStats = $derived.by(() => ({
		total: tasksForList.length,
		todo: tasksForList.filter((task) => task.status === 'todo').length,
		inProgress: tasksForList.filter((task) => task.status === 'in_progress').length,
		done: tasksForList.filter((task) => task.status === 'done').length
	}));
</script>

<svelte:head>
	<title>{data.project.name} — lista zadań</title>
	<meta name="description" content={`Panel listy zadań: ${data.project.name}.`} />
</svelte:head>

<TaskFormModal
	open={taskModalOpen}
	mode={taskModalMode}
	task={activeTask}
	{users}
	{projects}
	{labels}
	defaultProjectId={projectId}
	{submitting}
	submitError={taskSubmitError}
	onClose={closeTaskModal}
	onSubmit={handleTaskSubmit}
	onToggleLabel={handleToggleLabel}
/>

<TaskTimeModal
	open={timeModalOpen}
	task={activeTimeTask}
	onClose={closeTimeModal}
	onTimeLogged={() => loadDashboard({ silent: true })}
/>

<ConfirmModal
	open={deleteModalOpen}
	title="Usunąć to zadanie?"
	description={`Spowoduje to trwałe usunięcie „${taskToDelete?.title ?? 'wybranego zadania'}” z systemu.`}
	confirmLabel="Usuń zadanie"
	pending={deletePending}
	onClose={closeDeleteModal}
	onConfirm={handleDeleteTask}
/>

<div class="min-w-0 space-y-8 pb-12">
	<section class="rounded-2xl border bg-card p-6 shadow-sm">
		<p class="text-sm font-medium text-muted-foreground">Aktualna lista zadań</p>
		<h1 class="mt-2 text-3xl font-semibold">{data.project.name}</h1>
		<p class="mt-2 text-sm text-muted-foreground">Zarządzaj zadaniami przypisanymi do tej listy.</p>

		<div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			<div class="rounded-xl border bg-card p-3 shadow-sm">
				<p class="text-xs text-muted-foreground">Wszystkie</p>
				<p class="text-2xl font-semibold">{taskStats.total}</p>
			</div>

			<div class="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
				<p class="text-xs text-slate-500">Do zrobienia</p>
				<p class="text-2xl font-semibold text-slate-700">
					{taskStats.todo}
				</p>
			</div>

			<div class="rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
				<p class="text-xs text-amber-700">W toku</p>
				<p class="text-2xl font-semibold text-amber-800">
					{taskStats.inProgress}
				</p>
			</div>

			<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 shadow-sm">
				<p class="text-xs text-emerald-700">Zrobione</p>
				<p class="text-2xl font-semibold text-emerald-800">
					{taskStats.done}
				</p>
			</div>
		</div>
	</section>

	<DashboardToolbar
		{refreshing}
		onRefresh={() => loadDashboard({ silent: true })}
		onNewTask={openCreateTask}
	/>

	{#if loading}
		<DashboardLoading />
	{:else if bootError}
		<DashboardError message={bootError} onRetry={() => loadDashboard()} />
	{:else}
		<section class="grid min-w-0 gap-6">
			<div class="min-w-0 space-y-6">
				<TaskFiltersPanel
					bind:searchQuery
					bind:assigneeFilter
					bind:labelFilter
					bind:viewMode
					{users}
					{labels}
					filteredCount={filteredTasks.length}
					totalCount={tasksForList.length}
					{hasActiveFilters}
					onClearFilters={clearFilters}
				/>

				{#if tasksForList.length === 0}
					<EmptyTasksState onCreateTask={openCreateTask} />
				{:else if filteredTasks.length === 0}
					<NoMatchesState onResetFilters={clearFilters} />
				{:else if viewMode === 'list'}
					<BulkActionBar
						count={selectedIds.size}
						onClearSelection={clearSelection}
						onStatusChange={handleBulkStatusChange}
					/>
					<TaskListView
						tasks={sortedTasks}
						{selectedIds}
						{sortField}
						{sortDir}
						onSort={handleSort}
						onToggleSelect={toggleSelect}
						onToggleSelectAll={toggleSelectAll}
						onEditTask={openEditTask}
						onDeleteTask={promptDeleteTask}
						onLogTimeTask={openTimeModal}
					/>
				{:else}
					<TaskBoardView
						columns={boardColumns}
						onEditTask={openEditTask}
						onDeleteTask={promptDeleteTask}
						onLogTimeTask={openTimeModal}
					/>
				{/if}
			</div>
		</section>
	{/if}
</div>
