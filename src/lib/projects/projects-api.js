import { apiRequest } from '$lib/core/api-client';

export function createProject(payload) {
	return apiRequest('/projects', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export function deleteProject(projectId) {
	return apiRequest(`/projects/${projectId}`, {
		method: 'DELETE'
	});
}

export function fetchProjectTasks(projectId) {
	return apiRequest(`/projects/${projectId}/tasks`);
}
