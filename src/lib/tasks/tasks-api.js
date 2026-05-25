import { apiRequest } from '$lib/core/api-client';

export function fetchDashboardData() {
	return Promise.all([
		apiRequest('/tasks'),
		apiRequest('/users'),
		apiRequest('/projects'),
		apiRequest('/labels')
	]).then(([tasks, users, projects, labels]) => ({ tasks, users, projects, labels }));
}

export function createTask(payload) {
	return apiRequest('/tasks', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export function updateTask(taskId, payload) {
	return apiRequest(`/tasks/${taskId}`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
}

export function deleteTask(taskId) {
	return apiRequest(`/tasks/${taskId}`, {
		method: 'DELETE'
	});
}

export function addLabelToTask(taskId, labelId) {
	return apiRequest(`/tasks/${taskId}/labels`, {
		method: 'POST',
		body: JSON.stringify({ label_id: labelId })
	});
}

export function removeLabelFromTask(taskId, labelId) {
	return apiRequest(`/tasks/${taskId}/labels/${labelId}`, { method: 'DELETE' });
}
