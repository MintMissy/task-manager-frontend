function normalizeDateInput(value) {
	if (!value) return '';

	return String(value).slice(0, 10);
}

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
	month: 'short',
	day: 'numeric',
	year: 'numeric'
});

export function formatDisplayDate(value) {
	const normalized = normalizeDateInput(value);

	if (!normalized) return 'Brak terminu';

	const date = new Date(`${normalized}T12:00:00`);
	return dateFormatter.format(date);
}

export function isTaskOverdue(task) {
	const dueDate = normalizeDateInput(task?.due_date);

	if (!dueDate || task?.status === 'done') return false;

	const today = new Date().toISOString().slice(0, 10);
	return dueDate < today;
}
