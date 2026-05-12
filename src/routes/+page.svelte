<script>
	let { data } = $props();
</script>

<section class="space-y-6">
	<div>
		<p class="text-sm text-muted-foreground">Lista zadań</p>
		<h1 class="mt-2 text-3xl font-semibold">
			{data.project?.name ?? 'Nieznana lista'}
		</h1>
	</div>

	{#if data.tasks?.length}
		<div class="space-y-3">
			{#each data.tasks as task (task.id)}
				<div class="rounded-xl border bg-card p-4 shadow-sm">
					<h2 class="font-semibold">{task.title}</h2>

					{#if task.description}
						<p class="mt-1 text-sm text-muted-foreground">{task.description}</p>
					{/if}

					<p class="mt-2 text-xs text-muted-foreground">
						Status: {task.status}
					</p>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
			Brak zadań w tej liście.
		</div>
	{/if}
</section>