import { setContext, getContext } from 'svelte';
import { createLabel, deleteLabel, updateLabel } from '$lib/labels/labels-api';

export const defaultFormState = {
	show: false,
	id: null,
	name: '',
	color: 'blue',
	icon: 'tag',
	error: '',
	submitting: false
};

const MODEL_KEY = Symbol('etykietyModel');

export function setEtykietyModel() {
	return setContext(MODEL_KEY, new EtykietyModel());
}
export function getEtykietyModel() {
	return getContext(MODEL_KEY);
}

export class EtykietyModel {
	labelsState = $state([]);
	formState = $state({ ...defaultFormState });

	async createLabel(labelData) {
		return await createLabel(labelData);
	}
	async updateLabel(id, labelData) {
		return await updateLabel(id, labelData);
	}
	async deleteLabel(id) {
		return await deleteLabel(id);
	}
	updateForm(data) {
		Object.assign(this.formState, data);
	}
	resetForm() {
		this.formState = { ...defaultFormState };
	}
}
