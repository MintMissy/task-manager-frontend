import { setContext, getContext } from 'svelte';
import { getErrorMessage } from '$lib/core/errors';
import { toast } from '$lib/ui/toast.svelte';

import { invalidateAll } from '$app/navigation';

const CTRL_KEY = Symbol('uzytkownicyController');

export function setUzytkownicyController(model, getInitialData) {
	return setContext(CTRL_KEY, new UzytkownicyController(model, getInitialData));
}
export function getUzytkownicyController() {
	return getContext(CTRL_KEY);
}

export class UzytkownicyController {
	model = null;

	constructor(model, getInitialData) {
		this.model = model;
		if (getInitialData) {
			const initial = getInitialData();
			if (initial) this.onInitialize(initial);
		}
	}

	onInitialize(data) {
		this.model.usersState = data?.users ?? [];
	}

	// View Modal
	openView(user) {
		this.model.setViewState({ open: true, user });
	}
	closeView() {
		this.model.setViewState({ open: false, user: null });
	}

	// Form Modal
	openCreate() {
		this.model.setFormState({
			open: true,
			mode: 'create',
			user: null,
			error: ''
		});
	}
	openEdit(user) {
		this.model.setFormState({
			open: true,
			mode: 'edit',
			user,
			error: ''
		});
	}
	closeForm() {
		this.model.setFormState({
			open: false,
			user: null,
			error: ''
		});
	}
	async handleFormSubmit(payload) {
		this.model.setFormState({ submitting: true, error: '' });

		try {
			const currentFormState = this.model.formState;

			if (currentFormState.mode === 'create') {
				await this.model.createUser(payload);
				toast({
					title: 'Dodano użytkownika',
					description: `${payload.name} został zapisany.`,
					variant: 'success'
				});
			} else if (currentFormState.user) {
				await this.model.updateUser(currentFormState.user.id, payload);
				toast({
					title: 'Zaktualizowano użytkownika',
					description: 'Zmiany są widoczne w tabeli.',
					variant: 'success'
				});
			}

			await invalidateAll();
			this.closeForm();
		} catch (error) {
			this.model.setFormState({ error: getErrorMessage(error) });
		} finally {
			this.model.setFormState({ submitting: false });
		}
	}

	// Delete Modal
	openDelete(user) {
		this.model.setDeleteState({ open: true, target: user });
	}
	closeDelete() {
		this.model.setDeleteState({ open: false, target: null });
	}
	async confirmDelete() {
		const currentState = this.model.deleteState;
		if (!currentState.target) return;

		const removedName = currentState.target.name;
		this.model.setDeleteState({ pending: true });

		try {
			await this.model.deleteUser(currentState.target.id);
			this.closeDelete();
			toast({
				title: 'Usunięto użytkownika',
				description: `Konto „${removedName}” zostało usunięte.`,
				variant: 'success'
			});
			await invalidateAll();
		} catch (error) {
			toast({
				title: 'Usuwanie nie powiodło się',
				description: getErrorMessage(error),
				variant: 'destructive'
			});
		} finally {
			this.model.setDeleteState({ pending: false });
		}
	}
}
