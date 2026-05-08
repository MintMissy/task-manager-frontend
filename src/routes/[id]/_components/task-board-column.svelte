<script>
	import Badge from '$lib/components/ui/badge.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { STATUS_META } from '$lib/task-status';
	import TaskBoardCard from './task-board-card.svelte';

	let { column, onEditTask = () => {}, onDeleteTask = () => {}, onLogTimeTask = () => {} } = $props();

	function zadaniaLabel(n) {
		if (n === 1) return '1 zadanie';
		const o = n % 10;
		const oo = n % 100;
		if (o >= 2 && o <= 4 && (oo < 12 || oo > 14)) return `${n} zadania`;
		return `${n} zadań`;
	}
</script>

<Card class="overflow-hidden">
	<div class="border-b border-border/70 px-5 py-4">
		<div class="flex items-center justify-between gap-3">
			<div>
				<p class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
					{column.label}
				</p>
				<h3 class="mt-2 text-left text-xl font-semibold">{zadaniaLabel(column.tasks.length)}</h3>
			</div>
			<Badge variant={STATUS_META[column.value]?.variant ?? 'default'}>{column.label}</Badge>
		</div>
	</div>

	<div class="space-y-3 p-4">
		{#if column.tasks.length === 0}
			<div
				class="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-sm text-muted-foreground"
			>
				Brak zadań w tym statusie przy obecnych filtrach.
			</div>
		{:else}
			{#each column.tasks as task (task.id)}
				<TaskBoardCard {task} {onEditTask} {onDeleteTask} {onLogTimeTask} />
			{/each}
		{/if}
	</div>
</Card>
