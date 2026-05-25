<script>
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import LabelChip from '$lib/components/ui/label-chip.svelte';
	import { formatDisplayDate, isTaskOverdue } from '$lib/tasks/tasks-dates';
	import { CalendarClock, Clock, SquarePen, Trash2 } from '@lucide/svelte';

	let {
		task,
		gridClass = 'md:grid md:grid-cols-[2rem_minmax(14rem,1fr)_8.5rem_9.5rem_9rem_10rem_4.5rem] md:gap-x-4 md:items-start lg:grid-cols-[2rem_minmax(4rem,1fr)_8.5rem_9.5rem_9rem_10rem_4.5rem]',
		statusMeta = { label: '', variant: 'default' },
		selected = false,
		onToggleSelect = () => {},
		onEditTask = () => {},
		onDeleteTask = () => {},
		onLogTimeTask = () => {}
	} = $props();
</script>

<article class="px-5 py-5 transition-colors {selected ? 'bg-primary/5' : ''}">
	<div class="flex flex-col gap-4 {gridClass}">
		<div class="flex items-start justify-center pt-1">
			<input
				type="checkbox"
				class="size-4 rounded border-border"
				checked={selected}
				onchange={onToggleSelect}
			/>
		</div>
		<div class="min-w-0">
			<div class="flex flex-wrap items-center gap-3">
				<h3
					class="min-w-0 text-lg font-semibold break-words md:truncate lg:overflow-visible lg:whitespace-normal"
					title={task.title}
				>
					{task.title}
				</h3>
				{#if isTaskOverdue(task)}
					<Badge variant="destructive">Po terminie</Badge>
				{/if}
			</div>

			{#if task.description}
				<p class="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
					{task.description}
				</p>
			{/if}
			{#if task.labels?.length > 0}
				<div class="mt-2 flex flex-wrap gap-1">
					{#each task.labels as label (label.id)}
						<LabelChip {label} />
					{/each}
				</div>
			{/if}
		</div>

		<div class="min-w-0 md:pt-0.5">
			<Badge variant={statusMeta.variant} class="whitespace-nowrap">{statusMeta.label}</Badge>
		</div>

		<div class="flex min-w-0 items-center gap-2 text-sm text-muted-foreground md:pt-0.5">
			<CalendarClock class="size-4 shrink-0" />
			<span class="min-w-0 truncate">{formatDisplayDate(task.due_date)}</span>
		</div>

		<div class="min-w-0 md:pt-0.5">
			{#if Number(task.estimated_hours) > 0 || Number(task.logged_hours) > 0}
				<div class="flex flex-col gap-1.5">
					<span
						class="text-xs font-medium {Number(task.logged_hours) > Number(task.estimated_hours) &&
						Number(task.estimated_hours) > 0
							? 'text-destructive'
							: 'text-muted-foreground'}"
					>
						{task.logged_hours || 0}h / {task.estimated_hours || 0}h
					</span>
					{#if Number(task.estimated_hours) > 0}
						<div class="h-1.5 w-full max-w-[5rem] overflow-hidden rounded-full bg-muted/50">
							<div
								class="h-full rounded-full transition-all duration-300 {Number(task.logged_hours) >
								Number(task.estimated_hours)
									? 'bg-destructive'
									: 'bg-primary/80'}"
								style="width: {Math.min(
									100,
									((Number(task.logged_hours) || 0) / Number(task.estimated_hours)) * 100
								)}%"
							></div>
						</div>
					{/if}
				</div>
			{:else}
				<span class="text-xs text-muted-foreground/50">-</span>
			{/if}
		</div>

		<div class="min-w-0 text-sm text-muted-foreground md:pt-0.5">
			<p class="truncate" title={task.assigned_user_name || 'Nieprzypisane'}>
				{task.assigned_user_name || 'Nieprzypisane'}
			</p>
		</div>

		<div class="flex flex-col gap-2 md:w-full md:pt-0.5">
			<Button
				variant="outline"
				size="sm"
				class="w-full justify-center"
				onclick={() => onLogTimeTask(task)}
			>
				<Clock class="size-4" />
				Czas
			</Button>
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
