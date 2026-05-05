import { fetchDashboardData } from '$lib/task-api';

export async function load() {
	return fetchDashboardData();
}
