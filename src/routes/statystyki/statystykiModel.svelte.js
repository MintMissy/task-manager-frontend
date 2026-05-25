import { setContext, getContext } from 'svelte';
import { SvelteDate } from 'svelte/reactivity';
import { isTaskOverdue } from '$lib/tasks/tasks-dates';
import { STATUS_OPTIONS } from '$lib/tasks/tasks-status';

const MODEL_KEY = Symbol('statystykiModel');

export function setStatystykiModel() {
	return setContext(MODEL_KEY, new StatystykiModel());
}
export function getStatystykiModel() {
	return getContext(MODEL_KEY);
}

const PIE_R = 70;
const PIE_CX = 90;
const PIE_CY = 90;
const STATUS_COLORS = { todo: '#6b7280', in_progress: '#f59e0b', done: '#22c55e' };

function pieSlices(counts) {
	const total = counts.reduce((s, c) => s + c.count, 0);
	if (total === 0) return [];
	let angle = -Math.PI / 2;
	return counts.map((c) => {
		if (c.count === total && total > 0) {
			return {
				...c,
				d: `M ${PIE_CX} ${PIE_CY - PIE_R} A ${PIE_R} ${PIE_R} 0 1 1 ${PIE_CX} ${PIE_CY + PIE_R} A ${PIE_R} ${PIE_R} 0 1 1 ${PIE_CX} ${PIE_CY - PIE_R} Z`,
				color: STATUS_COLORS[c.value] ?? '#94a3b8'
			};
		}
		
		const sweep = (c.count / total) * 2 * Math.PI;
		const x1 = PIE_CX + PIE_R * Math.cos(angle);
		const y1 = PIE_CY + PIE_R * Math.sin(angle);
		angle += sweep;
		const x2 = PIE_CX + PIE_R * Math.cos(angle);
		const y2 = PIE_CY + PIE_R * Math.sin(angle);
		const large = sweep > Math.PI ? 1 : 0;
		return {
			...c,
			d: `M ${PIE_CX} ${PIE_CY} L ${x1} ${y1} A ${PIE_R} ${PIE_R} 0 ${large} 1 ${x2} ${y2} Z`,
			color: STATUS_COLORS[c.value] ?? '#94a3b8'
		};
	});
}

export class StatystykiModel {
	tasks = $state([]);
	projects = $state([]);
	labels = $state([]);

	totalTasks = $derived(this.tasks.length);
	
	doneTasks = $derived(this.tasks.filter((t) => t.status === 'done').length);
	
	overdueTasks = $derived(this.tasks.filter((t) => isTaskOverdue(t)).length);
	
	dueSoonTasks = $derived.by(() => {
		const today = new SvelteDate();
		today.setHours(0, 0, 0, 0);
		const dayAfter = new SvelteDate(today);
		dayAfter.setDate(dayAfter.getDate() + 2);

		return this.tasks.filter((t) => {
			if (t.status === 'done' || !t.due_date) return false;
			const d = new SvelteDate(String(t.due_date).slice(0, 10) + 'T12:00:00');
			return d >= today && d < dayAfter;
		}).length;
	});

	donePercent = $derived(this.totalTasks > 0 ? Math.round((this.doneTasks / this.totalTasks) * 100) : 0);

	statusCounts = $derived(
		STATUS_OPTIONS.map((opt) => ({
			...opt,
			count: this.tasks.filter((t) => t.status === opt.value).length
		}))
	);

	projectStats = $derived(
		this.projects.map((proj) => {
			const projTasks = this.tasks.filter((t) => String(t.project_id) === String(proj.id));
			const logged = projTasks.reduce((s, t) => s + (Number(t.logged_hours) || 0), 0);
			const estimated = projTasks.reduce((s, t) => s + (Number(t.estimated_hours) || 0), 0);
			const done = projTasks.filter((t) => t.status === 'done').length;
			return { ...proj, taskCount: projTasks.length, logged, estimated, done };
		}).filter((p) => p.taskCount > 0)
	);

	labelStats = $derived(
		this.labels.map((label) => ({
			...label,
			count: this.tasks.filter((t) => (t.labels ?? []).some((l) => l.id === label.id)).length
		})).filter((l) => l.count > 0).sort((a, b) => b.count - a.count)
	);

	slices = $derived(pieSlices(this.statusCounts));
}
