class ToastStore {
	items = $state([]);
	nextId = 0;

	push({ title, description = '', variant = 'default', duration = 4000 }) {
		const id = ++this.nextId;
		this.items.push({ id, title, description, variant });

		if (duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, duration);
		}

		return id;
	}

	remove(id) {
		this.items = this.items.filter((item) => item.id !== id);
	}
}

export const toastStore = new ToastStore();

export function toast(payload) {
	return toastStore.push(payload);
}

export function dismissToast(id) {
	toastStore.remove(id);
}
