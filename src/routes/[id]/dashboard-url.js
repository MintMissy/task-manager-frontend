/**
 * @param {string} q
 * @param {string} assignee
 * @param {URL} url
 */
export function filtersMatchUrl(q, assignee, url) {
	const qUrl = (url.searchParams.get('q') ?? '').trim();
	const aUrl = url.searchParams.get('assignee') ?? 'all';
	return q.trim() === qUrl && String(assignee) === String(aUrl);
}

/**
 * Preserves unrelated query keys; sets `q` and `assignee` from filter state.
 * @param {URL} url
 * @param {string} q
 * @param {string} assignee
 */
export function buildFilterSearch(url, q, assignee) {
	const pairs = [];
	for (const [key, value] of url.searchParams) {
		if (key === 'q' || key === 'assignee') continue;
		pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
	}
	if (q.trim()) pairs.push(`q=${encodeURIComponent(q.trim())}`);
	if (assignee !== 'all') pairs.push(`assignee=${encodeURIComponent(String(assignee))}`);
	return pairs.join('&');
}
