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
	import BulkActionBar from './_components/bulk-action-bar.svelte';
	import { buildFilterSearch, filtersMatchUrl } from './dashboard-url';
	import { setDashboardModel } from './dashboardModel.svelte.js';
	import { setDashboardController } from './dashboardController.svelte.js';

	let { data } = $props();

	const model = setDashboardModel();
	const controller = setDashboardController(model, () => data);

	// Reactively update when data changes during client-side navigation
	$effect.pre(() => {
		controller.onInitialize(data);
	});

	$effect(() => {
		const q = model.filterState.searchQuery;
		const a = model.filterState.assigneeFilter;
		const url = page.url;

		if (filtersMatchUrl(q, a, url)) return;

		const search = buildFilterSearch(url, q, a);
		const pathname = `/${page.params.id}${search ? `?${search}` : ''}`;

		goto(resolve(pathname), { replaceState: true, keepFocus: true, noScroll: true });
	});

	let filteredTasks = $derived(controller.getFilteredTasks());
	let sortedTasks = $derived(controller.getSortedTasks(filteredTasks));
	let boardColumns = $derived(controller.getBoardColumns(sortedTasks));
	let taskStats = $derived(controller.getTaskStats());

	let hasActiveFilters = $derived(
		Boolean(model.filterState.searchQuery.trim() || model.filterState.assigneeFilter !== 'all' || model.filterState.labelFilter.length > 0)
	);
</script>

<svelte:head>
	{#if model.dataState.project}
		<title>{model.dataState.project.name} — lista zadań</title>
		<meta name="description" content={`Panel listy zadań: ${model.dataState.project.name}.`} />
	{/if}
</svelte:head>

<TaskFormModal
	open={model.taskModalState.open}
	mode={model.taskModalState.mode}
	task={model.taskModalState.activeTask}
	users={model.dataState.users}
	projects={model.dataState.projects}
	labels={model.dataState.labels}
	defaultProjectId={model.dataState.projectId}
	submitting={model.taskModalState.submitting}
	submitError={model.taskModalState.error}
	onClose={() => controller.closeTaskModal()}
	onSubmit={(payload) => controller.handleTaskSubmit(payload)}
	onToggleLabel={(label) => controller.handleToggleLabel(label)}
/>

<TaskTimeModal
	open={model.timeModalState.open}
	task={model.timeModalState.activeTask}
	onClose={() => controller.closeTimeModal()}
	onTimeLogged={() => controller.reload(true)}
/>

<ConfirmModal
	open={model.deleteModalState.open}
	title="Usunąć to zadanie?"
	description={`Spowoduje to trwałe usunięcie „${model.deleteModalState.task?.title ?? 'wybranego zadania'}” z systemu.`}
	confirmLabel="Usuń zadanie"
	pending={model.deleteModalState.pending}
	onClose={() => controller.closeDeleteModal()}
	onConfirm={() => controller.handleDeleteTask()}
/>

<div class="min-w-0 space-y-8 pb-12">
	{#if model.dataState.project}
		<section class="rounded-2xl border bg-card p-6 shadow-sm">
			<p class="text-sm font-medium text-muted-foreground">Aktualna lista zadań</p>
			<h1 class="mt-2 text-3xl font-semibold">{model.dataState.project.name}</h1>
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
	{/if}

	<DashboardToolbar
		refreshing={model.uiState.refreshing}
		onRefresh={() => controller.reload(true)}
		onNewTask={() => controller.openCreateTask()}
	/>

	{#if model.uiState.loading}
		<DashboardLoading />
	{:else if model.uiState.bootError}
		<DashboardError message={model.uiState.bootError} onRetry={() => controller.reload()} />
	{:else}
		<section class="grid min-w-0 gap-6">
			<div class="min-w-0 space-y-6">
				<TaskFiltersPanel
					bind:searchQuery={model.filterState.searchQuery}
					bind:assigneeFilter={model.filterState.assigneeFilter}
					bind:labelFilter={model.filterState.labelFilter}
					bind:viewMode={model.filterState.viewMode}
					users={model.dataState.users}
					labels={model.dataState.labels}
					filteredCount={filteredTasks.length}
					totalCount={model.dataState.tasks.length}
					{hasActiveFilters}
					onClearFilters={() => controller.clearFilters()}
				/>

				{#if model.dataState.tasks.length === 0}
					<EmptyTasksState onCreateTask={() => controller.openCreateTask()} />
				{:else if filteredTasks.length === 0}
					<NoMatchesState onResetFilters={() => controller.clearFilters()} />
				{:else if model.filterState.viewMode === 'list'}
					<BulkActionBar
						count={model.selectionState.size}
						onClearSelection={() => controller.clearSelection()}
						onStatusChange={(status) => controller.handleBulkStatusChange(status)}
					/>
					<TaskListView
						tasks={sortedTasks}
						selectedIds={model.selectionState}
						sortField={model.filterState.sortField}
						sortDir={model.filterState.sortDir}
						onSort={(field) => controller.handleSort(field)}
						onToggleSelect={(id) => controller.toggleSelect(id)}
						onToggleSelectAll={() => controller.toggleSelectAll(sortedTasks)}
						onEditTask={(t) => controller.openEditTask(t)}
						onDeleteTask={(t) => controller.promptDeleteTask(t)}
						onLogTimeTask={(t) => controller.openTimeModal(t)}
					/>
				{:else}
					<TaskBoardView
						columns={boardColumns}
						onEditTask={(t) => controller.openEditTask(t)}
						onDeleteTask={(t) => controller.promptDeleteTask(t)}
						onLogTimeTask={(t) => controller.openTimeModal(t)}
					/>
				{/if}
			</div>
		</section>
	{/if}
</div>
