import { error } from '@sveltejs/kit';

export async function load({ params, parent, url }) {
	const { projects } = await parent();
	const project = projects.find((item) => String(item.id) === params.id);

	if (!project) {
		throw error(404, 'Nie znaleziono listy zadań');
	}

	return {
		project,
		filters: {
			q: url.searchParams.get('q') ?? '',
			assignee: url.searchParams.get('assignee') ?? 'all'
		}
	};
}
