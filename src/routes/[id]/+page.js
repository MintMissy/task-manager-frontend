import { error } from '@sveltejs/kit';
import { fetchDashboardData } from '$lib/tasks/tasks-api';
import { fetchProjectTasks } from '$lib/projects/projects-api';

export async function load({ params, url }) {
	const dashboard = await fetchDashboardData();
	const projectId = Number(params.id);

	const project = dashboard.projects.find((item) => item.id === projectId);

	if (!project) {
		throw error(404, 'Nie znaleziono listy zadań');
	}

	const tasks = await fetchProjectTasks(projectId);

	return {
		...dashboard,
		project,
		projectId,
		tasks,
		filters: {
			q: url.searchParams.get('q') ?? '',
			assignee: url.searchParams.get('assignee') ?? 'all'
		}
	};
}