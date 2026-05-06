import { env } from '$env/dynamic/public';

const API_BASE_URL = (env.PUBLIC_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

function createErrorMessage(status, fallback) {
	if (status === 400)
		return 'Żądanie jest nieprawidłowe. Sprawdź formularz zadania i spróbuj ponownie.';
	if (status === 403) return 'Nie masz uprawnień do wykonania tej operacji.';
	if (status === 404) return 'Nie znaleziono żądanego zasobu.';
	if (status === 409)
		return 'Operacja nie powiodła się z powodu konfliktu danych (np. duplikat adresu e-mail).';
	if (status >= 500)
		return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie za chwilę.';

	return fallback;
}

async function apiRequest(path, options = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(options.headers ?? {})
		},
		...options
	});

	const isJson = response.headers.get('content-type')?.includes('application/json');
	const data = isJson ? await response.json() : null;

	if (!response.ok) {
		const error = new Error(
			data?.error || createErrorMessage(response.status, 'Żądanie nie powiodło się.')
		);

		error.status = response.status;
		error.data = data;
		throw error;
	}

	return data;
}

export function fetchDashboardData() {
	return Promise.all([apiRequest('/tasks'), apiRequest('/users'), apiRequest('/projects')]).then(
		([tasks, users, projects]) => ({ tasks, users, projects })
	);
}

export function createProject(payload) {
	return apiRequest('/projects', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
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

export function deleteProject(projectId) {
	return apiRequest(`/projects/${projectId}`, {
		method: 'DELETE'
	});
}

export function createUser(payload) {
	return apiRequest('/users', {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export function updateUser(userId, payload) {
	return apiRequest(`/users/${userId}`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	});
}

export function deleteUser(userId) {
	return apiRequest(`/users/${userId}`, {
		method: 'DELETE'
	});
}

export function fetchProjectTasks(projectId) {
	return apiRequest(`/projects/${projectId}/tasks`);
}