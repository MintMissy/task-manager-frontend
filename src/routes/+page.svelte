<script>
	import { resolve } from '$app/paths';
	import Card from '$lib/components/ui/card.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Wybierz listę zadań</title>
	<meta
		name="description"
		content="Wybierz listę zadań z paska bocznego lub z poniższych kart, aby otworzyć panel."
	/>
</svelte:head>

<section class="space-y-6">
	<div>
		<h1 class="mt-2 text-3xl font-semibold">Wybierz listę zadań</h1>
		<p class="mt-3 text-sm text-muted-foreground">
			Wybierz listę z paska bocznego lub jedną z poniższych kart, aby otworzyć panel zadań.
		</p>
	</div>

	{#if data.projects?.length}
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each data.projects as project (project.id)}
				<a href={resolve('/[id]', { id: String(project.id) })} class="block">
					<Card class="h-full p-5 transition hover:border-primary/40 hover:bg-primary/5">
						<p class="text-sm text-muted-foreground">Lista zadań</p>
						<h2 class="mt-2 text-lg font-semibold">{project.name}</h2>
					</Card>
				</a>
			{/each}
		</div>
	{:else}
		<Card class="p-6">
			<h2 class="text-xl font-semibold">Brak list zadań</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Backend nie zwrócił żadnych projektów, więc nie ma jeszcze list zadań do wyświetlenia.
			</p>
		</Card>
	{/if}
</section>
