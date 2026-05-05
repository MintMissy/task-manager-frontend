<script>
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { fieldClass } from '$lib/utils';
	import { Columns3, LayoutList, Search } from '@lucide/svelte';

	let {
		searchQuery = $bindable(''),
		assigneeFilter = $bindable('all'),
		viewMode = $bindable('list'),
		users = [],
		filteredCount = 0,
		totalCount = 0,
		hasActiveFilters = false,
		onClearFilters = () => {}
	} = $props();
</script>

<Card class="p-5">
	<div class="flex flex-col gap-5">
		<div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
			<h2 class="mt-2 text-left text-2xl font-semibold">Filtruj zadania</h2>

			<div class="inline-flex rounded-lg border border-border/70 bg-muted/40 p-1">
				<Button
					variant={viewMode === 'list' ? 'secondary' : 'ghost'}
					class="rounded-md px-3"
					onclick={() => (viewMode = 'list')}
				>
					<LayoutList class="size-4" />
					Lista
				</Button>
				<Button
					variant={viewMode === 'board' ? 'secondary' : 'ghost'}
					class="rounded-md px-3"
					onclick={() => (viewMode = 'board')}
				>
					<Columns3 class="size-4" />
					Tablica
				</Button>
			</div>
		</div>

		<div class="grid gap-3 md:grid-cols-2">
			<label class="space-y-2 text-sm font-medium">
				<span>Szukaj zadań</span>
				<div class="relative">
					<Search
						class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<input
						class={`${fieldClass} pl-9`}
						type="search"
						placeholder="Tytuł lub opis"
						bind:value={searchQuery}
					/>
				</div>
			</label>

			<label class="space-y-2 text-sm font-medium">
				<span>Osoba</span>
				<select class={fieldClass} bind:value={assigneeFilter}>
					<option value="all">Wszyscy</option>
					{#each users as user (user.id)}
						<option value={String(user.id)}>{user.name}</option>
					{/each}
				</select>
			</label>
		</div>

		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-sm text-muted-foreground">
				Wyświetlono {filteredCount} z {totalCount} zadań.
			</p>

			{#if hasActiveFilters}
				<Button variant="ghost" class="sm:self-end" onclick={onClearFilters}>Wyczyść filtry</Button>
			{/if}
		</div>
	</div>
</Card>
