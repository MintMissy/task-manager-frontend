/** Polish locale: date + short time for timestamps (e.g. user `created_at`). */
export function formatDateTimePl(value) {
	if (!value) return '—';
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return String(value);
	return new Intl.DateTimeFormat('pl-PL', {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(d);
}
