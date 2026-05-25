<script>
	import Button from '$lib/components/ui/button.svelte';
	import { syncModalOpen } from '$lib/ui/dialog-sync';
	import { getLabelColor } from '$lib/labels/labels-config';
	import { STATUS_OPTIONS } from '$lib/tasks/tasks-status';
	import { fieldClass } from '$lib/ui/utils';

	function normalizeDateInput(value) {
		if (!value) return '';

		return String(value).slice(0, 10);
	}

	let {
		open = false,
		mode = 'create',
		task = null,
		users = [],
		projects = [],
		labels = [],
		defaultProjectId = '',
		submitting = false,
		submitError = '',
		onClose = () => {},
		onSubmit = () => {},
		onToggleLabel = () => {}
	} = $props();

	const textareaClass = `${fieldClass} min-h-28 h-auto`;

	const createInitialForm = (currentTask) => ({
		title: currentTask?.title ?? '',
		description: currentTask?.description ?? '',
		status: currentTask?.status ?? 'todo',
		due_date: normalizeDateInput(currentTask?.due_date),
		assigned_user_id: currentTask?.assigned_user_id ? String(currentTask.assigned_user_id) : '',
		project_id: currentTask?.project_id
			? String(currentTask.project_id)
			: String(defaultProjectId || ''),
		estimated_hours: currentTask?.estimated_hours ?? 0,
		labelIds: []
	});

	let form = $state(createInitialForm(null));
	let clientError = $state('');
	let dialogEl = $state();

	$effect.pre(() => {
		if (!open) return;
		form = createInitialForm(mode === 'edit' ? task : null);
		clientError = '';
	});

	$effect(() => {
		syncModalOpen(dialogEl, open);
	});

	function closeIfAllowed() {
		if (!submitting) {
			onClose();
		}
	}

	function handleSubmit(event) {
		event.preventDefault();

		if (!form.title.trim()) {
			clientError = 'Tytuł jest wymagany.';
			return;
		}

		clientError = '';

		onSubmit({
			title: form.title.trim(),
			description: form.description.trim() || null,
			status: form.status || 'todo',
			due_date: form.due_date || null,
			assigned_user_id: form.assigned_user_id ? Number(form.assigned_user_id) : null,
			project_id: defaultProjectId
				? Number(defaultProjectId)
				: form.project_id
					? Number(form.project_id)
					: null,
			estimated_hours: Number(form.estimated_hours) || 0,
			labelIds: form.labelIds
		});
	}
</script>

<dialog
	bind:this={dialogEl}
	class="fixed top-1/2 left-1/2 z-50 max-h-[min(calc(100vh-2rem),90dvh)] w-[min(100vw-2rem,42rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-2xl"
	aria-labelledby="task-modal-title"
	aria-modal="true"
	aria-hidden={!open}
	oncancel={(event) => {
		event.preventDefault();
		closeIfAllowed();
	}}
>
	<div class="flex items-start justify-between gap-6">
		<div>
			<h2 id="task-modal-title" class="mt-2 text-2xl font-semibold text-balance">
				{mode === 'create' ? 'Nowe zadanie' : 'Edycja zadania'}
			</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Tytuł jest wymagany; pozostałe pola są opcjonalne i powinny być zgodne z API.
			</p>
		</div>

		<Button variant="ghost" class="rounded-full px-3" onclick={closeIfAllowed}>Zamknij</Button>
	</div>

	<form class="mt-6 space-y-5" onsubmit={handleSubmit}>
		<div class="space-y-2">
			<label for="task-title" class="text-sm font-medium">Tytuł</label>
			<input
				id="task-title"
				class={fieldClass}
				type="text"
				placeholder="Np. wdrożenie panelu MVP"
				bind:value={form.title}
			/>
		</div>

		<div class="space-y-2">
			<label for="task-description" class="text-sm font-medium">Opis</label>
			<textarea
				id="task-description"
				class={textareaClass}
				placeholder="Opisz cel zadania, ograniczenia lub kolejny krok."
				bind:value={form.description}
			></textarea>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<label for="task-status" class="text-sm font-medium">Status</label>
				<select id="task-status" class={fieldClass} bind:value={form.status}>
					{#each STATUS_OPTIONS as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="space-y-2">
				<label for="task-due-date" class="text-sm font-medium">Termin</label>
				<input id="task-due-date" class={fieldClass} type="date" bind:value={form.due_date} />
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<label for="task-assignee" class="text-sm font-medium">Osoba</label>
				<select id="task-assignee" class={fieldClass} bind:value={form.assigned_user_id}>
					<option value="">Nieprzypisane</option>
					{#each users as user (user.id)}
						<option value={String(user.id)}>{user.name}</option>
					{/each}
				</select>
			</div>

			{#if !defaultProjectId}
				<div class="space-y-2">
					<label for="task-project" class="text-sm font-medium">Projekt</label>
					<select id="task-project" class={fieldClass} bind:value={form.project_id}>
						<option value="">Bez projektu</option>
						{#each projects as project (project.id)}
							<option value={String(project.id)}>{project.name}</option>
						{/each}
					</select>
				</div>
			{/if}
		</div>

		<div class="space-y-2 pt-2 border-t border-border/70">
			<h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Szacunki</h4>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<label for="task-estimated" class="text-sm font-medium">Szacowany czas (h)</label>
					<input id="task-estimated" class={fieldClass} type="number" step="0.5" min="0" bind:value={form.estimated_hours} />
				</div>
			</div>
		</div>

		{#if labels.length > 0}
			<div class="space-y-2 pt-2 border-t border-border/70">
				<h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Etykiety</h4>
				<div class="flex flex-wrap gap-2">
					{#each labels as label (label.id)}
						{@const assigned = mode === 'create' ? form.labelIds.includes(label.id) : (task?.labels ?? []).some((l) => l.id === label.id)}
						{@const colorMeta = getLabelColor(label.color)}
						<button
							type="button"
							class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all {assigned ? colorMeta.bg + ' ' + colorMeta.text + ' ring-2 ring-offset-1 ' + colorMeta.ring : 'bg-muted/50 text-muted-foreground hover:bg-muted'}"
							onclick={() => {
								if (mode === 'create') {
									if (form.labelIds.includes(label.id)) {
										form.labelIds = form.labelIds.filter(id => id !== label.id);
									} else {
										form.labelIds = [...form.labelIds, label.id];
									}
								} else {
									onToggleLabel(label);
								}
							}}
						>
							{label.name}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		{#if clientError || submitError}
			<div
				class="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-foreground"
			>
				{clientError || submitError}
			</div>
		{/if}

		<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
			<Button variant="outline" type="button" onclick={closeIfAllowed}>Anuluj</Button>
			<Button type="submit" disabled={submitting}>
				{submitting ? 'Zapisywanie…' : mode === 'create' ? 'Utwórz zadanie' : 'Zapisz zmiany'}
			</Button>
		</div>
	</form>
</dialog>
