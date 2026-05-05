<script>
	import Button from '$lib/components/ui/button.svelte';
	import { syncModalOpen } from '$lib/dialog-sync';
	import { fieldClass } from '$lib/utils';

	let {
		open = false,
		mode = 'create',
		user = null,
		submitting = false,
		submitError = '',
		onClose = () => {},
		onSubmit = () => {}
	} = $props();

	let dialogEl = $state();
	let form = $state({ name: '', email: '' });
	let clientError = $state('');

	$effect(() => {
		syncModalOpen(dialogEl, open);
	});

	$effect.pre(() => {
		if (!open) return;
		if (mode === 'edit' && user) {
			form = { name: user.name ?? '', email: user.email ?? '' };
		} else {
			form = { name: '', email: '' };
		}
		clientError = '';
	});

	function closeIfAllowed() {
		if (!submitting) {
			onClose();
		}
	}

	function handleSubmit(event) {
		event.preventDefault();

		if (!form.name.trim()) {
			clientError = 'Imię jest wymagane.';
			return;
		}
		if (!form.email.trim()) {
			clientError = 'E-mail jest wymagany.';
			return;
		}

		clientError = '';
		onSubmit({
			name: form.name.trim(),
			email: form.email.trim()
		});
	}
</script>

<dialog
	bind:this={dialogEl}
	class="fixed top-1/2 left-1/2 z-50 max-h-[min(calc(100vh-2rem),90dvh)] w-[min(100vw-2rem,32rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-2xl"
	aria-labelledby="user-form-title"
	aria-modal="true"
	aria-hidden={!open}
	oncancel={(event) => {
		event.preventDefault();
		closeIfAllowed();
	}}
>
	<h2 id="user-form-title" class="mt-2 text-2xl font-semibold text-balance">
		{mode === 'create' ? 'Nowy użytkownik' : 'Edycja użytkownika'}
	</h2>
	<p class="mt-2 text-sm text-muted-foreground">
		Imię i adres e-mail są wymagane. E-mail musi być unikalny w systemie.
	</p>

	<form class="mt-6 space-y-5" onsubmit={handleSubmit}>
		<div class="space-y-2">
			<label for="user-form-name" class="text-sm font-medium">Imię i nazwisko</label>
			<input
				id="user-form-name"
				class={fieldClass}
				type="text"
				autocomplete="name"
				bind:value={form.name}
				disabled={submitting}
			/>
		</div>

		<div class="space-y-2">
			<label for="user-form-email" class="text-sm font-medium">E-mail</label>
			<input
				id="user-form-email"
				class={fieldClass}
				type="email"
				autocomplete="email"
				bind:value={form.email}
				disabled={submitting}
			/>
		</div>

		{#if clientError || submitError}
			<div
				class="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-foreground"
				role="alert"
			>
				{clientError || submitError}
			</div>
		{/if}

		<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
			<Button variant="outline" type="button" onclick={closeIfAllowed} disabled={submitting}>
				Anuluj
			</Button>
			<Button type="submit" disabled={submitting}>
				{submitting ? 'Zapisywanie…' : mode === 'create' ? 'Utwórz' : 'Zapisz'}
			</Button>
		</div>
	</form>
</dialog>
