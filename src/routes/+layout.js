import { fetchDashboardData } from '$lib/tasks/tasks-api';

export async function load() {
	return fetchDashboardData();
}
