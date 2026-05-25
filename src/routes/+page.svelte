<script>
	import { resolve } from '$app/paths';
	import { getLayoutModel } from './layoutModel.svelte.js';
	const layoutModel = getLayoutModel();
</script>

<svelte:head>
	<title>Wszystkie listy zadań</title>
</svelte:head>

<section class="space-y-6">
	<div>
		<p class="text-sm text-muted-foreground">Panel główny</p>
		<h1 class="mt-2 text-3xl font-semibold">Wszystkie listy</h1>
	</div>

	{#if layoutModel.projectsState?.length}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each layoutModel.projectsState as project (project.id)}
				<a href={resolve(`/${project.id}`)} class="group block">
					<div
						class="rounded-xl border bg-card p-6 shadow-sm transition hover:border-primary hover:shadow-md"
					>
						<h2 class="text-lg font-semibold">{project.name}</h2>
						<p class="mt-2 text-sm text-muted-foreground">Przejdź do zadań &rarr;</p>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
			Brak list zadań. Wybierz opcję "Dodaj listę" w panelu bocznym.
		</div>
	{/if}
</section>
