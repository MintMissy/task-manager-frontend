<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ToastViewport from '$lib/components/toast-viewport.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import PromptModal from '$lib/components/ui/prompt-modal.svelte';
	import { Plus } from '@lucide/svelte';
	import './layout.css';
	import { setLayoutModel } from './layoutModel.svelte.js';
	import { setLayoutController } from './layoutController.svelte.js';

	let { data, children } = $props();

	const layoutModel = setLayoutModel();
	const layoutController = setLayoutController(layoutModel, () => data);

	$effect.pre(() => {
		layoutController.onInitialize(data);
	});
</script>

<div class="min-h-screen bg-background text-foreground">
	<div class="mx-auto flex flex-col lg:flex-row w-full max-w-368 gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
		<aside class="w-full lg:w-72 shrink-0">
			<Card class="p-4">
				<div class="space-y-4">
					<div class="space-y-1">
						<a
							href={resolve('/uzytkownicy')}
							class={`block rounded-md px-3 py-2 text-sm transition ${
								page.route.id === '/uzytkownicy'
									? 'bg-primary/10 font-semibold text-primary'
									: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
							}`}
						>
							Użytkownicy
						</a>
						<a
							href={resolve('/etykiety')}
							class={`block rounded-md px-3 py-2 text-sm transition ${
								page.route.id === '/etykiety'
									? 'bg-primary/10 font-semibold text-primary'
									: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
							}`}
						>
							Etykiety
						</a>
						<a
							href={resolve('/statystyki')}
							class={`block rounded-md px-3 py-2 text-sm transition ${
								page.route.id === '/statystyki'
									? 'bg-primary/10 font-semibold text-primary'
									: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
							}`}
						>
							Statystyki
						</a>
						<hr />
						<a
							href={resolve('/')}
							class="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-muted/60"
						>
							Listy zadań
						</a>
					</div>
					<nav class="space-y-1">
						{#if layoutModel.projectsState?.length}
							{#each layoutModel.projectsState as project (project.id)}
								<a 
									href={resolve(`/${String(project.id)}`)} 
									class={`block rounded-md px-3 py-2 text-sm transition ${
										page.params.id === String(project.id)
											? 'bg-primary/10 font-semibold text-primary'
											: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
									}`}>
									{project.name}
									
								{#if project.id > 3}
									<button
										type="button"
										class="text-red-500 hover:text-red-600"
										onclick={(event) => layoutController.handleDeleteProject(event, project.id, project.name, page.params.id)}>
										Usuń
									</button>
								{/if}
							</a> 
							{/each}
						{:else}
							<p class="px-3 py-2 text-sm text-muted-foreground">Brak dostępnych list zadań.</p>
						{/if}
					</nav>
					<Button variant="outline" class="w-full justify-center" onclick={() => layoutController.openAddListModal()}>
						<Plus class="size-4" />
						Dodaj listę
					</Button>
				</div>
			</Card>
		</aside>
		<main class="min-w-0 flex-1 overflow-x-hidden">
			{@render children()}
		</main>
	</div>
</div>

<PromptModal
	open={layoutModel.addListState.open}
	title="Nowa lista zadań"
	description="Nadaj krótką nazwę, aby odróżnić tę listę w panelu bocznym."
	fieldLabel="Nazwa listy"
	placeholder="Np. Produkt, Marketing, Dom"
	submitLabel="Utwórz listę"
	bind:value={layoutModel.addListState.name}
	pending={layoutModel.addListState.pending}
	error={layoutModel.addListState.error}
	onClose={() => layoutController.closeAddListModal()}
	onSubmit={() => layoutController.submitNewList()}
/>

<ToastViewport />
