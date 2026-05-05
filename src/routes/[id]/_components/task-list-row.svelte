<script>
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { formatDisplayDate, isTaskOverdue } from '$lib/task-dates';
	import { CalendarClock, SquarePen, Trash2 } from '@lucide/svelte';

	let {
		task,
		gridClass = 'lg:grid lg:grid-cols-[minmax(0,1fr)_8.5rem_9.5rem_10rem_4.5rem] lg:gap-x-4 lg:items-start',
		statusMeta = { label: '', variant: 'default' },
		onEditTask = () => {},
		onDeleteTask = () => {}
	} = $props();
</script>

<article class="px-5 py-5">
	<div class="flex flex-col gap-4 {gridClass}">
		<div class="min-w-0">
			<div class="flex flex-wrap items-center gap-3">
				<h3 class="min-w-0 truncate text-lg font-semibold" title={task.title}>{task.title}</h3>
				{#if isTaskOverdue(task)}
					<Badge variant="destructive">Po terminie</Badge>
				{/if}
			</div>

			{#if task.description}
				<p class="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
					{task.description}
				</p>
			{/if}
		</div>

		<div class="min-w-0 lg:pt-0.5">
			<Badge variant={statusMeta.variant} class="whitespace-nowrap">{statusMeta.label}</Badge>
		</div>

		<div class="flex min-w-0 items-center gap-2 text-sm text-muted-foreground lg:pt-0.5">
			<CalendarClock class="size-4 shrink-0" />
			<span class="min-w-0 truncate">{formatDisplayDate(task.due_date)}</span>
		</div>

		<div class="min-w-0 text-sm text-muted-foreground lg:pt-0.5">
			<p class="truncate" title={task.assigned_user_name || 'Nieprzypisane'}>
				{task.assigned_user_name || 'Nieprzypisane'}
			</p>
		</div>

		<div class="flex flex-col gap-2 lg:w-full lg:pt-0.5">
			<Button
				variant="outline"
				size="sm"
				class="w-full justify-center"
				onclick={() => onEditTask(task)}
			>
				<SquarePen class="size-4" />
				Edytuj
			</Button>
			<Button
				variant="ghost"
				size="sm"
				class="w-full justify-center text-destructive hover:bg-destructive/10 hover:text-destructive"
				onclick={() => onDeleteTask(task)}
			>
				<Trash2 class="size-4" />
				Usuń
			</Button>
		</div>
	</div>
</article>
