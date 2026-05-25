import { apiRequest } from '$lib/core/api-client';

export function fetchTimeLogs(taskId) {
	return apiRequest(`/tasks/${taskId}/time-logs`);
}

export function createTimeLog(taskId, payload) {
	return apiRequest(`/tasks/${taskId}/time-logs`, {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export function deleteTimeLog(logId) {
	return apiRequest(`/time-logs/${logId}`, {
		method: 'DELETE'
	});
}
