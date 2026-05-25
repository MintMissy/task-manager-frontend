<script>
	import { resolve } from '$app/paths';
	import Card from '$lib/components/ui/card.svelte';
	import LabelChip from '$lib/components/ui/label-chip.svelte';
	import { STATUS_META } from '$lib/tasks/tasks-status';
	import { setStatystykiModel } from './statystykiModel.svelte.js';
	import { setStatystykiController } from './statystykiController.svelte.js';

	let { data } = $props();

	const model = setStatystykiModel();
	const controller = setStatystykiController(model, () => data);

	// Reactively update when data changes during client-side navigation
	$effect.pre(() => {
		controller.onInitialize(data);
	});

	const PIE_CX = 90;
	const PIE_CY = 90;
	const STATUS_COLORS = { todo: '#6b7280', in_progress: '#f59e0b', done: '#22c55e' };
</script>

<svelte:head>
	<title>Statystyki — Task Manager</title>
	<meta name="description" content="Przegląd statystyk i postępów we wszystkich projektach." />
</svelte:head>

<div class="space-y-8 pb-12">
	<div>
		<h1 class="text-3xl font-bold">Statystyki</h1>
		<p class="mt-1 text-sm text-muted-foreground">Przegląd wszystkich projektów i zadań.</p>
	</div>

	<!-- Kafelki KPI -->
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		<Card class="p-5">
			<p class="text-sm text-muted-foreground">Wszystkich zadań</p>
			<p class="mt-1 text-4xl font-bold">{model.totalTasks}</p>
		</Card>
		<Card class="p-5">
			<p class="text-sm text-muted-foreground">Ukończonych</p>
			<p class="mt-1 text-4xl font-bold text-green-500">{model.doneTasks}</p>
			<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
				<div class="h-full rounded-full bg-green-500 transition-all" style="width: {model.donePercent}%"></div>
			</div>
			<p class="mt-1 text-xs text-muted-foreground">{model.donePercent}% ukończonych</p>
		</Card>
		<Card class="p-5">
			<p class="text-sm text-muted-foreground">Po terminie</p>
			<p class="mt-1 text-4xl font-bold {model.overdueTasks > 0 ? 'text-destructive' : ''}">{model.overdueTasks}</p>
		</Card>
		<Card class="p-5">
			<p class="text-sm text-muted-foreground">Zbliżające się terminy</p>
			<p class="mt-1 text-4xl font-bold {model.dueSoonTasks > 0 ? 'text-amber-500' : ''}">{model.dueSoonTasks}</p>
			<p class="mt-1 text-xs text-muted-foreground">dziś lub jutro</p>
		</Card>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Wykres kołowy statusów -->
		<Card class="p-6">
			<h2 class="mb-4 text-lg font-semibold">Rozkład statusów</h2>
			{#if model.totalTasks === 0}
				<p class="text-sm text-muted-foreground">Brak danych.</p>
			{:else}
				<div class="flex items-center gap-8">
					<svg viewBox="0 0 180 180" class="w-36 shrink-0">
						{#each model.slices as slice (slice.value)}
							<path d={slice.d} fill={slice.color} />
						{/each}
						<circle cx={PIE_CX} cy={PIE_CY} r="40" fill="var(--color-card)" />
						<text x={PIE_CX} y={PIE_CY + 5} text-anchor="middle" class="text-sm font-bold" fill="currentColor" font-size="18" font-weight="bold">{model.donePercent}%</text>
					</svg>
					<div class="space-y-2">
						{#each model.statusCounts as s (s.value)}
							<div class="flex items-center gap-2 text-sm">
								<span class="inline-block h-3 w-3 shrink-0 rounded-full" style="background:{STATUS_COLORS[s.value]}"></span>
								<span class="text-muted-foreground">{STATUS_META[s.value]?.label ?? s.label}</span>
								<span class="ml-auto font-semibold">{s.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</Card>

		<!-- Etykiety -->
		<Card class="p-6">
			<h2 class="mb-4 text-lg font-semibold">Etykiety</h2>
			{#if model.labelStats.length === 0}
				<p class="text-sm text-muted-foreground">Żadna etykieta nie jest jeszcze użyta.</p>
			{:else}
				<div class="space-y-3">
					{#each model.labelStats as label (label.id)}
						<div class="flex items-center gap-3">
							<LabelChip {label} />
							<div class="flex-1 overflow-hidden rounded-full bg-muted/50 h-2">
								<div
									class="h-full rounded-full bg-primary/60 transition-all"
									style="width: {Math.round((label.count / model.totalTasks) * 100)}%"
								></div>
							</div>
							<span class="w-6 text-right text-sm font-semibold">{label.count}</span>
						</div>
					{/each}
				</div>
			{/if}
		</Card>
	</div>

	<!-- Tabela projektów -->
	<Card class="overflow-hidden">
		<div class="border-b border-border/70 px-6 py-4">
			<h2 class="text-lg font-semibold">Projekty</h2>
		</div>
		{#if model.projectStats.length === 0}
			<p class="px-6 py-8 text-center text-sm text-muted-foreground">Brak projektów z zadaniami.</p>
		{:else}
			<div class="divide-y divide-border/70">
				{#each model.projectStats as proj (proj.id)}
					<div class="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
						<div class="min-w-0 flex-1">
							<a href={resolve(`/${proj.id}`)} class="font-semibold hover:underline">{proj.name}</a>
							<p class="mt-0.5 text-xs text-muted-foreground">
								{proj.taskCount} zadań · {proj.done} ukończonych
							</p>
						</div>
						<div class="flex items-center gap-4 text-sm">
							<div class="text-right">
								<p class="font-medium {proj.logged > proj.estimated && proj.estimated > 0 ? 'text-destructive' : 'text-foreground'}">{proj.logged.toFixed(1)}h / {proj.estimated.toFixed(1)}h</p>
								<p class="text-xs text-muted-foreground">zalogowano / szacunek</p>
							</div>
							{#if proj.estimated > 0}
								<div class="w-24">
									<div class="h-2 overflow-hidden rounded-full bg-muted/50">
										<div
											class="h-full rounded-full transition-all {proj.logged > proj.estimated ? 'bg-destructive' : 'bg-primary/70'}"
											style="width: {Math.min(100, (proj.logged / proj.estimated) * 100)}%"
										></div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Card>
</div>
