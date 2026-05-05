<script>
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { formatDisplayDate, isTaskOverdue } from '$lib/task-dates';
	import { SquarePen, Trash2 } from '@lucide/svelte';

	let { task, onEditTask = () => {}, onDeleteTask = () => {} } = $props();
</script>

<article class="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
	<div class="flex items-start justify-between gap-3">
		<div>
			<h4 class="text-base font-semibold">{task.title}</h4>
			<p class="mt-1 text-sm text-muted-foreground">
				{task.assigned_user_name || 'Nieprzypisane'}
			</p>
		</div>

		{#if isTaskOverdue(task)}
			<Badge variant="destructive">Po terminie</Badge>
		{/if}
	</div>

	{#if task.description}
		<p class="mt-3 text-sm leading-6 text-muted-foreground">{task.description}</p>
	{/if}

	<div class="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
		<span>{formatDisplayDate(task.due_date)}</span>
		<div class="flex gap-2">
			<Button variant="ghost" size="sm" onclick={() => onEditTask(task)}>
				<SquarePen class="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				class="text-destructive hover:bg-destructive/10 hover:text-destructive"
				onclick={() => onDeleteTask(task)}
			>
				<Trash2 class="size-4" />
			</Button>
		</div>
	</div>
</article>
