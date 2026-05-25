import { setContext, getContext } from 'svelte';
import { createUser, deleteUser, updateUser } from '$lib/users/users-api';

const MODEL_KEY = Symbol('uzytkownicyModel');

export function setUzytkownicyModel() {
	return setContext(MODEL_KEY, new UzytkownicyModel());
}
export function getUzytkownicyModel() {
	return getContext(MODEL_KEY);
}

export class UzytkownicyModel {
	usersState = $state([]);
	
	viewState = $state({
		open: false,
		user: null
	});

	formState = $state({
		open: false,
		mode: 'create',
		user: null,
		submitting: false,
		error: ''
	});

	deleteState = $state({
		open: false,
		target: null,
		pending: false
	});


	setViewState(data) {
		Object.assign(this.viewState, data);
	}
	setFormState(data) {
		Object.assign(this.formState, data);
	}
	setDeleteState(data) {
		Object.assign(this.deleteState, data);
	}
	async createUser(userData) {
		return await createUser(userData);
	}
	async updateUser(id, userData) {
		return await updateUser(id, userData);
	}
	async deleteUser(id) {
		return await deleteUser(id);
	}
}
