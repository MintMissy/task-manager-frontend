/**
 * Keeps a native `<dialog>` in sync with a boolean `open` prop (showModal / close).
 * @param {HTMLDialogElement | null | undefined} el
 * @param {boolean} open
 */
export function syncModalOpen(el, open) {
	if (!el) return;
	if (open && !el.open) {
		el.showModal();
		return;
	}
	if (!open && el.open) {
		el.close();
	}
}
