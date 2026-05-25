import { apiRequest } from '$lib/core/api-client';

export function fetchLabels() {
	return apiRequest('/labels');
}

export function createLabel(payload) {
	return apiRequest('/labels', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateLabel(labelId, payload) {
	return apiRequest(`/labels/${labelId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteLabel(labelId) {
	return apiRequest(`/labels/${labelId}`, { method: 'DELETE' });
}
