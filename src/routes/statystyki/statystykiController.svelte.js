import { setContext, getContext } from 'svelte';

const CTRL_KEY = Symbol('statystykiController');

export function setStatystykiController(model, getInitialData) {
	return setContext(CTRL_KEY, new StatystykiController(model, getInitialData));
}
export function getStatystykiController() {
	return getContext(CTRL_KEY);
}

export class StatystykiController {
	model = null;
	constructor(model, getInitialData) {
		this.model = model;
		if (getInitialData) {
			const initial = getInitialData();
			if (initial) this.onInitialize(initial);
		}
	}

	onInitialize(data) {
		this.model.tasks = data?.tasks ?? [];
		this.model.projects = data?.projects ?? [];
		this.model.labels = data?.labels ?? [];
	}
}
