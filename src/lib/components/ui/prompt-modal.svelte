<script>
	import Button from '$lib/components/ui/button.svelte';
	import { syncModalOpen } from '$lib/ui/dialog-sync';
	import { fieldClass } from '$lib/ui/utils';

	let {
		open = false,
		title = '',
		description = '',
		fieldLabel = '',
		placeholder = '',
		value = $bindable(''),
		submitLabel = 'Zapisz',
		pending = false,
		error = '',
		inputId = 'prompt-modal-input',
		onClose = () => {},
		onSubmit = () => {}
	} = $props();

	let dialogEl = $state();

	$effect(() => {
		syncModalOpen(dialogEl, open);
	});

	function closeIfAllowed() {
		if (!pending) {
			onClose();
		}
	}

	function handleFormSubmit(event) {
		event.preventDefault();
		if (!pending) {
			onSubmit();
		}
	}
</script>

<dialog
	bind:this={dialogEl}
	class="fixed top-1/2 left-1/2 z-50 max-h-[min(calc(100vh-2rem),90dvh)] w-[min(100vw-2rem,32rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-2xl"
	aria-labelledby="prompt-modal-title"
	aria-modal="true"
	aria-hidden={!open}
	oncancel={(event) => {
		event.preventDefault();
		closeIfAllowed();
	}}
>
	<h2 id="prompt-modal-title" class="mt-2 text-2xl font-semibold text-balance">{title}</h2>
	{#if description}
		<p class="mt-3 text-sm text-muted-foreground">{description}</p>
	{/if}

	<form class="mt-6 space-y-5" onsubmit={handleFormSubmit}>
		<div class="space-y-2">
			<label for={inputId} class="text-sm font-medium">{fieldLabel}</label>
			<input
				id={inputId}
				class={fieldClass}
				type="text"
				{placeholder}
				autocomplete="off"
				bind:value
				disabled={pending}
			/>
		</div>

		{#if error}
			<p class="text-sm text-destructive" role="alert">{error}</p>
		{/if}

		<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
			<Button variant="outline" type="button" onclick={closeIfAllowed} disabled={pending}>
				Anuluj
			</Button>
			<Button type="submit" disabled={pending}>
				{pending ? 'Zapisywanie…' : submitLabel}
			</Button>
		</div>
	</form>
</dialog>
