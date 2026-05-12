<script>
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import LabelChip from '$lib/components/ui/label-chip.svelte';
	import { formatDisplayDate, isTaskOverdue } from '$lib/task-dates';
	import { SquarePen, Trash2, Clock } from '@lucide/svelte';

	let { task, onEditTask = () => {}, onDeleteTask = () => {}, onLogTimeTask = () => {} } = $props();
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

	{#if Number(task.estimated_hours) > 0 || Number(task.logged_hours) > 0}
		<div class="mt-4">
			<div class="flex justify-between text-xs mb-1.5">
				<span class="text-muted-foreground">Czas pracy</span>
				<span class="font-medium {Number(task.logged_hours) > Number(task.estimated_hours) && Number(task.estimated_hours) > 0 ? 'text-destructive' : 'text-foreground'}">
					{task.logged_hours || 0}h / {task.estimated_hours || 0}h
				</span>
			</div>
			{#if Number(task.estimated_hours) > 0}
				<div class="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
					<div 
						class="h-full rounded-full transition-all duration-300 {Number(task.logged_hours) > Number(task.estimated_hours) ? 'bg-destructive' : 'bg-primary/80'}" 
						style="width: {Math.min(100, (Number(task.logged_hours) || 0) / Number(task.estimated_hours) * 100)}%"
					></div>
				</div>
			{/if}
		</div>
	{/if}

	{#if task.labels?.length > 0}
		<div class="mt-3 flex flex-wrap gap-1">
			{#each task.labels as label (label.id)}
				<LabelChip {label} />
			{/each}
		</div>
	{/if}

	<div class="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
		<span>{formatDisplayDate(task.due_date)}</span>
		<div class="flex gap-2">
			<Button variant="ghost" size="sm" onclick={() => onLogTimeTask(task)}>
				<Clock class="size-4" />
			</Button>
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
