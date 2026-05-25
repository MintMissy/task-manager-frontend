import { setContext, getContext } from 'svelte';
import { getErrorMessage } from '$lib/core/errors';
import { toast } from '$lib/ui/toast.svelte';

import { invalidateAll } from '$app/navigation';

const CTRL_KEY = Symbol('etykietyController');

export function setEtykietyController(model, getInitialData) {
	return setContext(CTRL_KEY, new EtykietyController(model, getInitialData));
}
export function getEtykietyController() {
	return getContext(CTRL_KEY);
}

export class EtykietyController {
	model = null;

	constructor(model, getInitialData) {
		this.model = model;
		if (getInitialData) {
			const initial = getInitialData();
			if (initial) this.onInitialize(initial);
		}
	}

	onInitialize(data) {
		this.model.labelsState = data.labels ?? [];
	}
	openCreate() {
		this.model.resetForm();
		this.model.updateForm({ show: true });
	}
	openEdit(label) {
		this.model.updateForm({
			show: true,
			id: label.id,
			name: label.name,
			color: label.color,
			icon: label.icon,
			error: ''
		});
	}
	cancelForm() {
		this.model.resetForm();
	}
	async handleSubmit(e) {
		if (e) e.preventDefault();
		
		const currentForm = this.model.formState;
		const sanitizedName = currentForm.name.trim();

		if (!sanitizedName) {
			this.model.updateForm({ error: 'Nazwa jest wymagana.' });
			return;
		}

		this.model.updateForm({ submitting: true, error: '' });

		try {
			if (currentForm.id) {
				await this.model.updateLabel(currentForm.id, {
					name: sanitizedName,
					color: currentForm.color,
					icon: currentForm.icon
				});
				toast({ title: 'Zaktualizowano etykietę', variant: 'success' });
			} else {
				await this.model.createLabel({
					name: sanitizedName,
					color: currentForm.color,
					icon: currentForm.icon
				});
				toast({ title: 'Dodano etykietę', variant: 'success' });
			}
			
			await invalidateAll();
			this.model.resetForm();
		} catch (err) {
			this.model.updateForm({ error: getErrorMessage(err) });
		} finally {
			this.model.updateForm({ submitting: false });
		}
	}
	async handleDelete(label) {
		if (!confirm(`Usunąć etykietę "${label.name}"? Zostanie odpięta od wszystkich zadań.`)) return;
		
		try {
			await this.model.deleteLabel(label.id);
			toast({ title: 'Usunięto etykietę', variant: 'success' });
			await invalidateAll();
		} catch (err) {
			toast({ title: 'Błąd', description: getErrorMessage(err), variant: 'destructive' });
		}
	}
	updateFormName(name) {
		this.model.updateForm({ name });
	}
	updateFormColor(color) {
		this.model.updateForm({ color });
	}
	updateFormIcon(icon) {
		this.model.updateForm({ icon });
	}
}
