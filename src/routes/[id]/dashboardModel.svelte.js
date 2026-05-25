import { setContext, getContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import { createTask, updateTask, deleteTask, addLabelToTask, removeLabelFromTask } from '$lib/tasks/tasks-api';

const MODEL_KEY = Symbol('dashboardModel');

export function setDashboardModel() {
	return setContext(MODEL_KEY, new DashboardModel());
}

export function getDashboardModel() {
	return getContext(MODEL_KEY);
}

export class DashboardModel {
    dataState = $state({ tasks: [], users: [], projects: [], labels: [], projectId: null, project: null });
    uiState = $state({ loading: false, refreshing: false, bootError: '' });
    filterState = $state({ searchQuery: '', assigneeFilter: 'all', labelFilter: [], viewMode: 'list', sortField: 'created_at', sortDir: 'desc' });
    selectionState = $state(new SvelteSet());
    taskModalState = $state({ open: false, mode: 'create', activeTask: null, submitting: false, error: '' });
    timeModalState = $state({ open: false, activeTask: null });
    deleteModalState = $state({ open: false, task: null, pending: false });

    setData(data) { Object.assign(this.dataState, data); }
    setUi(data) { Object.assign(this.uiState, data); }
    setFilters(data) { Object.assign(this.filterState, data); }
    setSelection(set) { this.selectionState = set; }
    setTaskModal(data) { Object.assign(this.taskModalState, data); }
    setTimeModal(data) { Object.assign(this.timeModalState, data); }
    setDeleteModal(data) { Object.assign(this.deleteModalState, data); }

    async createTask(payload) { return await createTask(payload); }
    async updateTask(id, payload) { return await updateTask(id, payload); }
    async deleteTask(id) { return await deleteTask(id); }
    async addLabelToTask(taskId, labelId) { return await addLabelToTask(taskId, labelId); }
    async removeLabelFromTask(taskId, labelId) { return await removeLabelFromTask(taskId, labelId); }
}
