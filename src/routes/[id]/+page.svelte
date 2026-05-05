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
	import { getErrorMessage } from '$lib/errors';
	import { createTask, deleteTask, fetchDashboardData, updateTask } from '$lib/task-api';
	import { STATUS_OPTIONS } from '$lib/task-status';
	import { toast } from '$lib/toast.svelte';
	import { buildFilterSearch, filtersMatchUrl } from './dashboard-url';

	let { data } = $props();
	const initialTasks = () => data.tasks ?? [];
	const initialUsers = () => data.users ?? [];
	const initialProjects = () => data.projects ?? [];

	let loading = $state(false);
	let refreshing = $state(false);
	let submitting = $state(false);
	let deletePending = $state(false);
	let bootError = $state('');

	let tasks = $state.raw(initialTasks());
	let users = $state.raw(initialUsers());
	let projects = $state.raw(initialProjects());

	let searchQuery = $state('');
	let assigneeFilter = $state('all');
	let viewMode = $state('list');

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

	let deleteModalOpen = $state(false);
	let taskToDelete = $state(null);

	let projectId = $derived(page.params.id);

	let tasksForList = $derived.by(() =>
		tasks.filter((task) => String(task.project_id ?? '') === projectId)
	);

	let filteredTasks = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();

		return tasksForList.filter((task) => {
			const matchesQuery =
				!query ||
				task.title?.toLowerCase().includes(query) ||
				task.description?.toLowerCase().includes(query);
			const matchesAssignee =
				assigneeFilter === 'all' || String(task.assigned_user_id ?? '') === assigneeFilter;

			return matchesQuery && matchesAssignee;
		});
	});

	let hasActiveFilters = $derived(Boolean(searchQuery.trim() || assigneeFilter !== 'all'));

	let boardColumns = $derived.by(() =>
		STATUS_OPTIONS.map((option) => ({
			...option,
			tasks: filteredTasks.filter((task) => task.status === option.value)
		}))
	);

	async function loadDashboard({ silent = false } = {}) {
		if (silent) {
			refreshing = true;
		} else {
			loading = true;
			bootError = '';
		}

		try {
			const dashboardData = await fetchDashboardData();

			tasks = dashboardData.tasks;
			users = dashboardData.users;
			projects = dashboardData.projects;
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

	async function handleTaskSubmit(payload) {
		submitting = true;
		taskSubmitError = '';

		try {
			if (taskModalMode === 'create') {
				await createTask(payload);
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
	defaultProjectId={projectId}
	{submitting}
	submitError={taskSubmitError}
	onClose={closeTaskModal}
	onSubmit={handleTaskSubmit}
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

<div class="space-y-8 pb-12">
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
		<section class="grid gap-6">
			<div class="space-y-6">
				<TaskFiltersPanel
					bind:searchQuery
					bind:assigneeFilter
					bind:viewMode
					{users}
					filteredCount={filteredTasks.length}
					totalCount={tasksForList.length}
					hasActiveFilters={hasActiveFilters}
					onClearFilters={clearFilters}
				/>

				{#if tasksForList.length === 0}
					<EmptyTasksState onCreateTask={openCreateTask} />
				{:else if filteredTasks.length === 0}
					<NoMatchesState onResetFilters={clearFilters} />
				{:else if viewMode === 'list'}
					<TaskListView
						tasks={filteredTasks}
						onEditTask={openEditTask}
						onDeleteTask={promptDeleteTask}
					/>
				{:else}
					<TaskBoardView
						columns={boardColumns}
						onEditTask={openEditTask}
						onDeleteTask={promptDeleteTask}
					/>
				{/if}
			</div>
		</section>
	{/if}
</div>
