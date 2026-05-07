<script>
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ToastViewport from '$lib/components/toast-viewport.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import PromptModal from '$lib/components/ui/prompt-modal.svelte';
	import { getErrorMessage } from '$lib/errors';
	import { toast } from '$lib/toast.svelte';
	import { Plus } from '@lucide/svelte';
	import './layout.css';
	import { fetchDashboardData, createProject, deleteProject } from '$lib/task-api';

	let { data, children } = $props();

	let addListOpen = $state(false);
	let newListName = $state('');
	let createListPending = $state(false);
	let createListError = $state('');

	function openAddListModal() {
		newListName = '';
		createListError = '';
		addListOpen = true;
	}

	function closeAddListModal() {
		addListOpen = false;
		createListError = '';
	}

	async function submitNewList() {
		const name = newListName.trim();
		if (!name) {
			createListError = 'Podaj nazwę listy.';
			return;
		}

		createListPending = true;
		createListError = '';

		try {
			const project = await createProject({ name });
			const id = project?.id;
			if (id == null) {
				throw new Error('API nie zwróciło identyfikatora nowej listy.');
			}

			closeAddListModal();
			await invalidateAll();

			toast({
				title: 'Dodano listę',
				description: `Lista „${name}” jest gotowa do użycia.`,
				variant: 'success'
			});

			await goto(resolve(`/${String(id)}`));
		} catch (error) {
			createListError = getErrorMessage(error);
		} finally {
			createListPending = false;
		}
	}

	async function handleDeleteProject(event, projectId, projectName) {
	event.preventDefault();
	event.stopPropagation();

	const confirmed = confirm(`Czy na pewno usunąć listę "${projectName}"?`);
	if (!confirmed) return;

	try {
		await deleteProject(projectId);

		toast({
			title: 'Usunięto listę',
			description: `Lista „${projectName}” została usunięta.`,
			variant: 'success'
		});

		await invalidateAll();

		if (page.params.id === String(projectId)) {
			await goto(resolve('/'));
		}
	} catch (error) {
		toast({
			title: 'Błąd usuwania',
			description: getErrorMessage(error),
			variant: 'error'
		});
	}
}

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
						<hr />
						<a
							href={resolve('/')}
							class="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-muted/60"
						>
							Listy zadań
						</a>
					</div>
					<nav class="space-y-1">
						{#if data.projects?.length}
							{#each data.projects as project (project.id)}
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
										onclick={(event) => handleDeleteProject(event, project.id, project.name)}>
										Usuń
									</button>
								{/if}
							</a> 
							{/each}
						{:else}
							<p class="px-3 py-2 text-sm text-muted-foreground">Brak dostępnych list zadań.</p>
						{/if}
					</nav>
					<Button variant="outline" class="w-full justify-center" onclick={openAddListModal}>
						<Plus class="size-4" />
						Dodaj listę
					</Button>
				</div>
			</Card>
		</aside>
		<main class="min-w-0 flex-1 overflow-hidden">
			{@render children()}
		</main>
	</div>
</div>

<PromptModal
	open={addListOpen}
	title="Nowa lista zadań"
	description="Nadaj krótką nazwę, aby odróżnić tę listę w panelu bocznym."
	fieldLabel="Nazwa listy"
	placeholder="Np. Produkt, Marketing, Dom"
	submitLabel="Utwórz listę"
	bind:value={newListName}
	pending={createListPending}
	error={createListError}
	onClose={closeAddListModal}
	onSubmit={submitNewList}
/>

<ToastViewport />
