<script>
	import Card from '$lib/components/ui/card.svelte';
	import { STATUS_META } from '$lib/task-status';
	import { ChevronUp, ChevronDown, ChevronsUpDown } from '@lucide/svelte';
	import TaskListRow from './task-list-row.svelte';

	let {
		tasks = [],
		selectedIds = new Set(),
		sortField = 'created_at',
		sortDir = 'asc',
		onSort = () => {},
		onToggleSelect = () => {},
		onToggleSelectAll = () => {},
		onEditTask = () => {},
		onDeleteTask = () => {},
		onLogTimeTask = () => {}
	} = $props();

	const listTableGridClass =
		'lg:grid lg:grid-cols-[2rem_minmax(0,1fr)_8.5rem_9.5rem_9rem_10rem_4.5rem] lg:gap-x-4 lg:items-start';

	function taskStatus(task) {
		return STATUS_META[task.status] ?? { label: task.status, variant: 'default' };
	}

	const allSelected = $derived(tasks.length > 0 && tasks.every((t) => selectedIds.has(t.id)));

	const sortableHeader = 'flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors select-none';
</script>

{#snippet sortIcon(field)}
	{@const Icon = sortField === field ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown}
	<Icon class="size-3 text-muted-foreground/60" />
{/snippet}

<Card class="overflow-hidden">
	<div class="hidden border-b border-border/70 px-5 py-4 {listTableGridClass}">
		<div class="flex items-center justify-center">
			<input
				type="checkbox"
				class="size-4 rounded border-border"
				checked={allSelected}
				onchange={onToggleSelectAll}
			/>
		</div>
		<button class={sortableHeader} onclick={() => onSort('title')}>
			<span class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Zadanie</span>
			{@render sortIcon('title')}
		</button>
		<button class={sortableHeader} onclick={() => onSort('status')}>
			<span class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Status</span>
			{@render sortIcon('status')}
		</button>
		<button class={sortableHeader} onclick={() => onSort('due_date')}>
			<span class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Termin</span>
			{@render sortIcon('due_date')}
		</button>
		<button class={sortableHeader} onclick={() => onSort('logged_hours')}>
			<span class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Czas pracy</span>
			{@render sortIcon('logged_hours')}
		</button>
		<span class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Przypisanie</span>
		<span class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Akcje</span>
	</div>


	<div class="divide-y divide-border/70">
		{#each tasks as task (task.id)}
			<TaskListRow
				{task}
				statusMeta={taskStatus(task)}
				gridClass={listTableGridClass}
				selected={selectedIds.has(task.id)}
				onToggleSelect={() => onToggleSelect(task.id)}
				{onEditTask}
				{onDeleteTask}
				{onLogTimeTask}
			/>
		{/each}
	</div>
</Card>
