import { env } from '$env/dynamic/public';

const API_BASE_URL = (env.PUBLIC_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

function createErrorMessage(status, fallback) {
	if (status === 400)
		return 'Żądanie jest nieprawidłowe. Sprawdź formularz zadania i spróbuj ponownie.';
	if (status === 403) return 'Nie masz uprawnień do wykonania tej operacji.';
	if (status === 404) return 'Nie znaleziono żądanego zasobu.';
	if (status === 409)
		return 'Operacja nie powiodła się z powodu konfliktu danych (np. duplikat adresu e-mail).';
	if (status >= 500) return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie za chwilę.';

	return fallback;
}

export async function apiRequest(path, options = {}) {
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
