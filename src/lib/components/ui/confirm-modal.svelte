<script>
	import Button from '$lib/components/ui/button.svelte';
	import { syncModalOpen } from '$lib/dialog-sync';

	let {
		open = false,
		title = 'Czy na pewno?',
		description = '',
		confirmLabel = 'Potwierdź',
		pending = false,
		onClose = () => {},
		onConfirm = () => {}
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
</script>

<dialog
	bind:this={dialogEl}
	class="fixed top-1/2 left-1/2 z-50 max-h-[min(calc(100vh-2rem),90dvh)] w-[min(100vw-2rem,32rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-2xl"
	aria-labelledby="confirm-modal-title"
	aria-modal="true"
	aria-hidden={!open}
	oncancel={(event) => {
		event.preventDefault();
		closeIfAllowed();
	}}
>
	<h2 id="confirm-modal-title" class="mt-2 text-2xl font-semibold text-balance">{title}</h2>
	<p class="mt-3 text-sm text-muted-foreground">{description}</p>

	<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
		<Button variant="outline" onclick={closeIfAllowed} disabled={pending}>Anuluj</Button>
		<Button variant="destructive" onclick={onConfirm} disabled={pending}>
			{pending ? 'Usuwanie…' : confirmLabel}
		</Button>
	</div>
</dialog>
