<script>
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import ConfirmModal from '$lib/components/ui/confirm-modal.svelte';
	import { getErrorMessage } from '$lib/errors';
	import { formatDateTimePl } from '$lib/format-datetime';
	import { createUser, deleteUser, updateUser } from '$lib/task-api';
	import { toast } from '$lib/toast.svelte';
	import { Eye, Pencil, Plus, Trash2, Users } from '@lucide/svelte';
	import UserFormModal from './_components/user-form-modal.svelte';
	import UserViewModal from './_components/user-view-modal.svelte';

	let { data } = $props();

	function userCountSubtitle(n) {
		if (n === 0) return 'Brak użytkowników w systemie';
		if (n === 1) return '1 użytkownik w systemie';
		const o = n % 10;
		const oo = n % 100;
		if (o >= 2 && o <= 4 && (oo < 12 || oo > 14)) return `${n} użytkownicy w systemie`;
		return `${n} użytkowników w systemie`;
	}

	let viewOpen = $state(false);
	let viewUser = $state(null);

	let formOpen = $state(false);
	let formMode = $state('create');
	let formUser = $state(null);
	let formSubmitting = $state(false);
	let formError = $state('');

	let deleteOpen = $state(false);
	let deleteTarget = $state(null);
	let deletePending = $state(false);

	function openView(u) {
		viewUser = u;
		viewOpen = true;
	}

	function closeView() {
		viewOpen = false;
		viewUser = null;
	}

	function openCreate() {
		formMode = 'create';
		formUser = null;
		formError = '';
		formOpen = true;
	}

	function openEdit(u) {
		formMode = 'edit';
		formUser = u;
		formError = '';
		formOpen = true;
	}

	function closeForm() {
		formOpen = false;
		formUser = null;
		formError = '';
	}

	async function handleFormSubmit(payload) {
		formSubmitting = true;
		formError = '';

		try {
			if (formMode === 'create') {
				await createUser(payload);
				toast({
					title: 'Dodano użytkownika',
					description: `${payload.name} został zapisany.`,
					variant: 'success'
				});
			} else if (formUser) {
				await updateUser(formUser.id, payload);
				toast({
					title: 'Zaktualizowano użytkownika',
					description: 'Zmiany są widoczne w tabeli.',
					variant: 'success'
				});
			}

			await invalidateAll();
			closeForm();
		} catch (error) {
			formError = getErrorMessage(error);
		} finally {
			formSubmitting = false;
		}
	}

	function openDelete(u) {
		deleteTarget = u;
		deleteOpen = true;
	}

	function closeDelete() {
		deleteOpen = false;
		deleteTarget = null;
	}

	async function confirmDelete() {
		if (!deleteTarget) return;

		const removedName = deleteTarget.name;
		deletePending = true;

		try {
			await deleteUser(deleteTarget.id);
			await invalidateAll();
			closeDelete();
			toast({
				title: 'Usunięto użytkownika',
				description: `Konto „${removedName}” zostało usunięte.`,
				variant: 'success'
			});
		} catch (error) {
			toast({
				title: 'Usuwanie nie powiodło się',
				description: getErrorMessage(error),
				variant: 'destructive'
			});
		} finally {
			deletePending = false;
		}
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
				<p class="text-sm text-muted-foreground">{userCountSubtitle(data.users.length)}</p>
			</div>
		</div>
		<Button onclick={openCreate}>
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
					{#each data.users as u (u.id)}
						<tr class="hover:bg-muted/20">
							<td class="px-4 py-3 font-mono text-muted-foreground">{u.id}</td>
							<td class="px-4 py-3 font-medium">{u.name}</td>
							<td class="px-4 py-3 text-muted-foreground">{u.email}</td>
							<td class="px-4 py-3 text-muted-foreground">{formatDateTimePl(u.created_at)}</td>
							<td class="px-4 py-3">
								<div class="flex flex-wrap justify-end gap-1">
									<Button variant="ghost" size="sm" onclick={() => openView(u)} title="Podgląd">
										<Eye class="size-4" />
										<span class="sr-only">Podgląd</span>
									</Button>
									<Button variant="ghost" size="sm" onclick={() => openEdit(u)} title="Edytuj">
										<Pencil class="size-4" />
										<span class="sr-only">Edytuj</span>
									</Button>
									<Button
										variant="ghost"
										size="sm"
										class="text-destructive hover:bg-destructive/10 hover:text-destructive"
										onclick={() => openDelete(u)}
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

<UserViewModal open={viewOpen} user={viewUser} onClose={closeView} />

{#key `${formMode}-${formUser?.id ?? 'new'}`}
	<UserFormModal
		open={formOpen}
		mode={formMode}
		user={formUser}
		submitting={formSubmitting}
		submitError={formError}
		onClose={closeForm}
		onSubmit={handleFormSubmit}
	/>
{/key}

<ConfirmModal
	open={deleteOpen}
	title="Usunąć tego użytkownika?"
	description={`Spowoduje to trwałe usunięcie „${deleteTarget?.name ?? 'wybranego użytkownika'}” z systemu. Powiązane zadania pozostaną, ale bez przypisania.`}
	confirmLabel="Usuń użytkownika"
	pending={deletePending}
	onClose={closeDelete}
	onConfirm={confirmDelete}
/>
