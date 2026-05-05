<script>
	import Card from '$lib/components/ui/card.svelte';
	import { STATUS_META } from '$lib/task-status';
	import TaskListRow from './task-list-row.svelte';

	let { tasks = [], onEditTask = () => {}, onDeleteTask = () => {} } = $props();

	const listTableGridClass =
		'lg:grid lg:grid-cols-[minmax(0,1fr)_8.5rem_9.5rem_10rem_4.5rem] lg:gap-x-4 lg:items-start';

	function taskStatus(task) {
		return STATUS_META[task.status] ?? { label: task.status, variant: 'default' };
	}
</script>

<Card class="overflow-hidden">
	<div
		class="hidden border-b border-border/70 px-5 py-4 {listTableGridClass}"
	>
		<span class="min-w-0 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase"
			>Zadanie</span
		>
		<span class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Status</span>
		<span class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Termin</span>
		<span class="min-w-0 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase"
			>Przypisanie</span
		>
		<span class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Akcje</span>
	</div>

	<div class="divide-y divide-border/70">
		{#each tasks as task (task.id)}
			<TaskListRow
				{task}
				statusMeta={taskStatus(task)}
				gridClass={listTableGridClass}
				{onEditTask}
				{onDeleteTask}
			/>
		{/each}
	</div>
</Card>
