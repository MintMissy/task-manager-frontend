<script>
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import ConfirmModal from '$lib/components/ui/confirm-modal.svelte';
	import { formatDateTimePl } from '$lib/core/format-datetime';
	import { Eye, Pencil, Plus, Trash2, Users } from '@lucide/svelte';
	import UserFormModal from './_components/user-form-modal.svelte';
	import UserViewModal from './_components/user-view-modal.svelte';
	import { setUzytkownicyModel } from './uzytkownicyModel.svelte.js';
	import { setUzytkownicyController } from './uzytkownicyController.svelte.js';

	let { data } = $props();

	const model = setUzytkownicyModel();
	const controller = setUzytkownicyController(model, () => data);

	$effect.pre(() => {
		controller.onInitialize(data);
	});

	function userCountSubtitle(n) {
		if (n === 0) return 'Brak użytkowników w systemie';
		if (n === 1) return '1 użytkownik w systemie';
		const o = n % 10;
		const oo = n % 100;
		if (o >= 2 && o <= 4 && (oo < 12 || oo > 14)) return `${n} użytkownicy w systemie`;
		return `${n} użytkowników w systemie`;
	}
</script>

<svelte:head>
	<title>Użytkownicy</title>
	<meta name="description" content="Zarządzanie użytkownikami: przegląd, dodawanie, edycja i usuwanie." />
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-3">
			<div class="rounded-xl bg-primary/10 p-3 text-primary">
				<Users class="size-6" />
			</div>
			<div>
				<h1 class="text-2xl font-semibold tracking-tight">Użytkownicy</h1>
				<p class="text-sm text-muted-foreground">{userCountSubtitle(model.usersState.length)}</p>
			</div>
		</div>
		<Button onclick={() => controller.openCreate()}>
			<Plus class="size-4" />
			Dodaj użytkownika
		</Button>
	</div>

	<Card class="overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full min-w-[40rem] text-left text-sm">
				<thead>
					<tr class="border-b border-border/70 bg-muted/30">
						<th class="px-4 py-3 font-semibold text-muted-foreground">ID</th>
						<th class="px-4 py-3 font-semibold text-muted-foreground">Imię</th>
						<th class="px-4 py-3 font-semibold text-muted-foreground">E-mail</th>
						<th class="px-4 py-3 font-semibold text-muted-foreground">Utworzono</th>
						<th class="px-4 py-3 text-right font-semibold text-muted-foreground">Akcje</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border/70">
					{#each model.usersState as u (u.id)}
						<tr class="hover:bg-muted/20">
							<td class="px-4 py-3 font-mono text-muted-foreground">{u.id}</td>
							<td class="px-4 py-3 font-medium">{u.name}</td>
							<td class="px-4 py-3 text-muted-foreground">{u.email}</td>
							<td class="px-4 py-3 text-muted-foreground">{formatDateTimePl(u.created_at)}</td>
							<td class="px-4 py-3">
								<div class="flex flex-wrap justify-end gap-1">
									<Button variant="ghost" size="sm" onclick={() => controller.openView(u)} title="Podgląd">
										<Eye class="size-4" />
										<span class="sr-only">Podgląd</span>
									</Button>
									<Button variant="ghost" size="sm" onclick={() => controller.openEdit(u)} title="Edytuj">
										<Pencil class="size-4" />
										<span class="sr-only">Edytuj</span>
									</Button>
									<Button
										variant="ghost"
										size="sm"
										class="text-destructive hover:bg-destructive/10 hover:text-destructive"
										onclick={() => controller.openDelete(u)}
										title="Usuń"
									>
										<Trash2 class="size-4" />
										<span class="sr-only">Usuń</span>
									</Button>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="px-4 py-12 text-center text-muted-foreground">
								Brak użytkowników. Dodaj pierwszy rekord przyciskiem powyżej.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Card>
</div>

<UserViewModal open={model.viewState.open} user={model.viewState.user} onClose={() => controller.closeView()} />

{#key `${model.formState.mode}-${model.formState.user?.id ?? 'new'}`}
	<UserFormModal
		open={model.formState.open}
		mode={model.formState.mode}
		user={model.formState.user}
		submitting={model.formState.submitting}
		submitError={model.formState.error}
		onClose={() => controller.closeForm()}
		onSubmit={(payload) => controller.handleFormSubmit(payload)}
	/>
{/key}

<ConfirmModal
	open={model.deleteState.open}
	title="Usunąć tego użytkownika?"
	description={`Spowoduje to trwałe usunięcie „${model.deleteState.target?.name ?? 'wybranego użytkownika'}” z systemu. Powiązane zadania pozostaną, ale bez przypisania.`}
	confirmLabel="Usuń użytkownika"
	pending={model.deleteState.pending}
	onClose={() => controller.closeDelete()}
	onConfirm={() => controller.confirmDelete()}
/>
