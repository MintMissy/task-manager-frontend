import { setContext, getContext } from 'svelte';
import { SvelteDate } from 'svelte/reactivity';
import { getErrorMessage } from '$lib/core/errors';
import { toast } from '$lib/ui/toast.svelte';
import { formatDisplayDate, isTaskOverdue } from '$lib/tasks/tasks-dates';
import { goto, invalidateAll } from '$app/navigation';
import { resolve } from '$app/paths';

const CTRL_KEY = Symbol('layoutController');

export function setLayoutController(model, getInitialData) {
	return setContext(CTRL_KEY, new LayoutController(model, getInitialData));
}
export function getLayoutController() {
	return getContext(CTRL_KEY);
}

export class LayoutController {
	model = null;

	constructor(model, getInitialData) {
		this.model = model;
		if (getInitialData) {
			const initial = getInitialData();
			if (initial) this.onInitialize(initial);
		}
	}

	onInitialize(data) {
		this.model.projectsState = data.projects ?? [];
		this.model.tasksState = data.tasks ?? [];
		this.checkDueTasks(data.tasks);
	}

	checkDueTasks(tasks) {
		if (this.model.notifState.shown) return;
		
		const allTasks = tasks ?? [];
		if (allTasks.length === 0) return;
		
		this.model.setNotifShown(true);

		const today = new SvelteDate();
		today.setHours(0, 0, 0, 0);
		const dayAfter = new SvelteDate(today);
		dayAfter.setDate(dayAfter.getDate() + 2);

		const activeTasks = allTasks.filter((t) => t.status !== 'done' && t.due_date);
		const overdue = activeTasks.filter((t) => isTaskOverdue(t));
		const dueSoon = activeTasks.filter((t) => {
			const d = new SvelteDate(String(t.due_date).slice(0, 10) + 'T12:00:00');
			return d >= today && d < dayAfter;
		});

		if (overdue.length > 0) {
			const titles = overdue.slice(0, 2).map((t) => '"' + t.title + '"').join(', ');
			const extra = overdue.length > 2 ? ` i ${overdue.length - 2} więcej` : '';
			toast({
				title: overdue.length === 1 ? 'Zadanie po terminie' : `${overdue.length} zadania po terminie`,
				description: titles + extra,
				variant: 'destructive',
				duration: 6000
			});
		}

		if (dueSoon.length > 0) {
			const titles = dueSoon.slice(0, 2).map((t) => '"' + t.title + '" (' + formatDisplayDate(t.due_date) + ')').join(', ');
			const extra = dueSoon.length > 2 ? ` i ${dueSoon.length - 2} więcej` : '';
			toast({
				title: 'Termin się zbliża',
				description: titles + extra,
				variant: 'default',
				duration: 6000
			});
		}
	}

	openAddListModal() {
		this.model.setAddListState({ name: '', error: '', open: true });
	}

	closeAddListModal() {
		this.model.setAddListState({ error: '', open: false });
	}

	async submitNewList() {
		const state = this.model.addListState;
		const name = state.name.trim();
		if (!name) {
			this.model.setAddListState({ error: 'Podaj nazwę listy.' });
			return;
		}

		this.model.setAddListState({ pending: true, error: '' });

		try {
			const project = await this.model.createProject({ name });
			const id = project?.id;
			if (id == null) {
				throw new Error('API nie zwróciło identyfikatora nowej listy.');
			}

			this.closeAddListModal();

			toast({
				title: 'Dodano listę',
				description: `Lista „${name}” jest gotowa do użycia.`,
				variant: 'success'
			});

			await invalidateAll();
			await goto(resolve(`/${String(id)}`));
		} catch (error) {
			this.model.setAddListState({ error: getErrorMessage(error) });
		} finally {
			this.model.setAddListState({ pending: false });
		}
	}

	async handleDeleteProject(event, projectId, projectName, activeProjectId) {
		event.preventDefault();
		event.stopPropagation();

		const confirmed = confirm(`Czy na pewno usunąć listę "${projectName}"?`);
		if (!confirmed) return;

		try {
			await this.model.deleteProject(projectId);

			toast({
				title: 'Usunięto listę',
				description: `Lista „${projectName}” została usunięta.`,
				variant: 'success'
			});

			await invalidateAll();

			if (activeProjectId === String(projectId)) {
				await goto(resolve('/'));
			}
		} catch (error) {
			toast({
				title: 'Błąd usuwania',
				description: getErrorMessage(error),
				variant: 'destructive'
			});
		}
	}
}
