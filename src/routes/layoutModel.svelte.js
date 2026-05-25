import { setContext, getContext } from 'svelte';
import { createProject, deleteProject } from '$lib/projects/projects-api';

const MODEL_KEY = Symbol('layoutModel');

export function setLayoutModel() {
	return setContext(MODEL_KEY, new LayoutModel());
}
export function getLayoutModel() {
	return getContext(MODEL_KEY);
}

export class LayoutModel {
	projectsState = $state([]);
	tasksState = $state([]);

	notifState = $state({ shown: false });
	addListState = $state({
		open: false,
		name: '',
		pending: false,
		error: ''
	});

	setNotifShown(shown) {
		this.notifState.shown = shown;
	}
	setAddListState(data) {
		Object.assign(this.addListState, data);
	}
	async createProject(data) {
		return await createProject(data);
	}
	async deleteProject(id) {
		await deleteProject(id);
	}
}
