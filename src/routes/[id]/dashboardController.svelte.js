import { getErrorMessage } from '$lib/core/errors';
import { STATUS_OPTIONS } from '$lib/tasks/tasks-status';
import { toast } from '$lib/ui/toast.svelte';
import { invalidateAll } from '$app/navigation';
import { getContext, setContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';

const CTRL_KEY = Symbol('dashboardController');

export function setDashboardController(model, getInitialData) {
	return setContext(CTRL_KEY, new DashboardController(model, getInitialData));
}

export function getDashboardController() {
	return getContext(CTRL_KEY);
}

export class DashboardController {
	model = null;

	constructor(model, getInitialData) {
		this.model = model;
		if (getInitialData) {
			const initial = getInitialData();
			if (initial) this.onInitialize(initial);
		}
	}

	onInitialize(data) {
		this.model.setData({
			tasks: data.tasks ?? [],
			users: data.users ?? [],
			projects: data.projects ?? [],
			labels: data.labels ?? [],
			projectId: data.projectId,
			project: data.project
		});

		const currentFilters = this.model.filterState;
		this.model.setFilters({
			searchQuery: data.filters?.q ?? currentFilters.searchQuery,
			assigneeFilter: data.filters?.assignee ?? currentFilters.assigneeFilter
		});
	}

	getFilteredTasks() {
		const dataState = this.model.dataState;
		const filterState = this.model.filterState;
		const query = filterState.searchQuery.trim().toLowerCase();

		return dataState.tasks.filter((task) => {
			const matchesQuery =
				!query ||
				task.title?.toLowerCase().includes(query) ||
				task.description?.toLowerCase().includes(query);
			const matchesAssignee =
				filterState.assigneeFilter === 'all' ||
				String(task.assigned_user_id ?? '') === filterState.assigneeFilter;
			const matchesLabels =
				filterState.labelFilter.length === 0 ||
				filterState.labelFilter.every((lid) => (task.labels ?? []).some((l) => l.id === lid));

			return matchesQuery && matchesAssignee && matchesLabels;
		});
	}

	getSortedTasks(filteredTasks) {
		const filterState = this.model.filterState;
		const arr = [...filteredTasks];
		const dir = filterState.sortDir === 'asc' ? 1 : -1;

		return arr.sort((a, b) => {
			if (filterState.sortField === 'title') {
				return dir * (a.title ?? '').localeCompare(b.title ?? '', 'pl');
			}
			if (filterState.sortField === 'status') {
				const order = { todo: 0, in_progress: 1, done: 2 };
				return dir * ((order[a.status] ?? 0) - (order[b.status] ?? 0));
			}
			if (filterState.sortField === 'due_date') {
				const da = a.due_date ? a.due_date : '';
				const db = b.due_date ? b.due_date : '';
				if (!da && !db) return 0;
				if (!da) return 1;
				if (!db) return -1;
				return dir * da.localeCompare(db);
			}
			if (filterState.sortField === 'logged_hours') {
				return dir * ((Number(a.logged_hours) || 0) - (Number(b.logged_hours) || 0));
			}
			return dir * (a.id - b.id);
		});
	}

	getBoardColumns(sortedTasks) {
		return STATUS_OPTIONS.map((option) => ({
			...option,
			tasks: sortedTasks.filter((task) => task.status === option.value)
		}));
	}

	getTaskStats() {
		const dataState = this.model.dataState;
		return {
			total: dataState.tasks.length,
			todo: dataState.tasks.filter((task) => task.status === 'todo').length,
			inProgress: dataState.tasks.filter((task) => task.status === 'in_progress').length,
			done: dataState.tasks.filter((task) => task.status === 'done').length
		};
	}

	handleSort(field) {
		const filters = this.model.filterState;
		if (filters.sortField === field) {
			this.model.setFilters({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' });
		} else {
			this.model.setFilters({ sortField: field, sortDir: 'asc' });
		}
	}

	toggleSelect(taskId) {
		const current = this.model.selectionState;
		const next = new SvelteSet(current);
		if (next.has(taskId)) next.delete(taskId);
		else next.add(taskId);
		this.model.setSelection(next);
	}

	toggleSelectAll(sortedTasks) {
		const current = this.model.selectionState;
		if (current.size === sortedTasks.length) {
			this.model.setSelection(new SvelteSet());
		} else {
			this.model.setSelection(new SvelteSet(sortedTasks.map((t) => t.id)));
		}
	}

	clearSelection() {
		this.model.setSelection(new SvelteSet());
	}

	clearFilters() {
		this.model.setFilters({ searchQuery: '', assigneeFilter: 'all', labelFilter: [] });
		this.clearSelection();
	}

	setFilter(key, val) {
		this.model.setFilters({ [key]: val });
	}

	async reload(silent = false) {
		const data = this.model.dataState;
		try {
			if (silent) {
				this.model.setUi({ refreshing: true });
			} else {
				this.model.setUi({ loading: true, bootError: '' });
			}
			await invalidateAll();
		} catch (error) {
			const message = getErrorMessage(error);
			if (silent && data.tasks.length > 0) {
				toast({
					title: 'Odświeżanie nie powiodło się',
					description: message,
					variant: 'destructive'
				});
			} else {
				this.model.setUi({ bootError: message });
			}
		} finally {
			this.model.setUi({ loading: false, refreshing: false });
		}
	}

	openCreateTask() {
		this.model.setTaskModal({ mode: 'create', activeTask: null, error: '', open: true });
	}
	openEditTask(task) {
		this.model.setTaskModal({ mode: 'edit', activeTask: task, error: '', open: true });
	}
	closeTaskModal() {
		this.model.setTaskModal({ open: false, activeTask: null, error: '' });
	}
	async handleTaskSubmit(payload) {
		this.model.setTaskModal({ submitting: true, error: '' });
		const modal = this.model.taskModalState;
		const data = this.model.dataState;

		try {
			if (modal.mode === 'create') {
				const labelIds = payload.labelIds || [];
				delete payload.labelIds;

				const newTask = await this.model.createTask({
					...payload,
					project_id: Number(data.projectId)
				});

				if (labelIds.length > 0 && newTask?.id) {
					for (const labelId of labelIds) {
						await this.model.addLabelToTask(newTask.id, labelId);
					}
				}
			} else {
				delete payload.labelIds;
				await this.model.updateTask(modal.activeTask.id, payload);
			}

			await this.reload(true);
			this.closeTaskModal();

			toast({
				title: modal.mode === 'create' ? 'Utworzono zadanie' : 'Zaktualizowano zadanie',
				description:
					modal.mode === 'create'
						? 'Nowe zadanie zostało zapisane w systemie.'
						: 'Zmiany zadania są widoczne na liście.',
				variant: 'success'
			});
		} catch (error) {
			this.model.setTaskModal({ error: getErrorMessage(error) });
		} finally {
			this.model.setTaskModal({ submitting: false });
		}
	}

	promptDeleteTask(task) {
		this.model.setDeleteModal({ task, open: true });
	}
	closeDeleteModal() {
		this.model.setDeleteModal({ task: null, open: false });
	}
	async handleDeleteTask() {
		const modal = this.model.deleteModalState;
		if (!modal.task) return;

		this.model.setDeleteModal({ pending: true });

		try {
			await this.model.deleteTask(modal.task.id);
			await this.reload(true);
			this.closeDeleteModal();

			toast({
				title: 'Usunięto zadanie',
				description: 'Zadanie zostało usunięte z systemu i z listy.',
				variant: 'success'
			});
		} catch (error) {
			toast({
				title: 'Usuwanie nie powiodło się',
				description: getErrorMessage(error),
				variant: 'destructive'
			});
		} finally {
			this.model.setDeleteModal({ pending: false });
		}
	}

	openTimeModal(task) {
		this.model.setTimeModal({ activeTask: task, open: true });
	}
	closeTimeModal() {
		this.model.setTimeModal({ activeTask: null, open: false });
	}

	async handleToggleLabel(label) {
		const modal = this.model.taskModalState;
		if (!modal.activeTask) return;

		const assigned = (modal.activeTask.labels ?? []).some((l) => l.id === label.id);
		try {
			if (assigned) {
				await this.model.removeLabelFromTask(modal.activeTask.id, label.id);
			} else {
				await this.model.addLabelToTask(modal.activeTask.id, label.id);
			}
			await this.reload(true);

			const refreshedData = this.model.dataState;
			const refreshedTask = refreshedData.tasks.find((t) => t.id === modal.activeTask.id);
			if (refreshedTask) {
				this.model.setTaskModal({ activeTask: refreshedTask });
			}
		} catch (error) {
			toast({
				title: 'Błąd etykiety',
				description: getErrorMessage(error),
				variant: 'destructive'
			});
		}
	}

	async handleBulkStatusChange(status) {
		const selection = this.model.selectionState;
		const data = this.model.dataState;
		const ids = [...selection];
		if (ids.length === 0) return;

		try {
			await Promise.all(
				ids.map((id) => {
					const task = data.tasks.find((t) => t.id === id);
					if (!task) return Promise.resolve();
					return this.model.updateTask(id, {
						title: task.title,
						description: task.description,
						status,
						due_date: task.due_date,
						assigned_user_id: task.assigned_user_id,
						project_id: task.project_id,
						estimated_hours: task.estimated_hours
					});
				})
			);
			await this.reload(true);
			this.clearSelection();
			toast({ title: `Zmieniono status ${ids.length} zadań`, variant: 'success' });
		} catch (error) {
			toast({ title: 'Błąd', description: getErrorMessage(error), variant: 'destructive' });
		}
	}
}
