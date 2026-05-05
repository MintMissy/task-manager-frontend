export const STATUS_OPTIONS = [
	{ value: 'todo', label: 'Do zrobienia' },
	{ value: 'in_progress', label: 'W toku' },
	{ value: 'done', label: 'Zrobione' }
];

export const STATUS_META = {
	todo: {
		label: 'Do zrobienia',
		variant: 'muted'
	},
	in_progress: {
		label: 'W toku',
		variant: 'warning'
	},
	done: {
		label: 'Zrobione',
		variant: 'success'
	}
};
