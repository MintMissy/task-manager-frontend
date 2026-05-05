<script>
	import Button from '$lib/components/ui/button.svelte';
	import { syncModalOpen } from '$lib/dialog-sync';
	import { formatDateTimePl } from '$lib/format-datetime';

	let { open = false, user = null, onClose = () => {} } = $props();
	let dialogEl = $state();

	$effect(() => {
		syncModalOpen(dialogEl, open);
	});

	function close() {
		onClose();
	}
</script>

<dialog
	bind:this={dialogEl}
	class="fixed top-1/2 left-1/2 z-50 max-h-[min(calc(100vh-2rem),90dvh)] w-[min(100vw-2rem,32rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-2xl"
	aria-labelledby="user-view-title"
	aria-modal="true"
	aria-hidden={!open}
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
>
	{#if user}
		<h2 id="user-view-title" class="mt-2 text-2xl font-semibold text-balance">Użytkownik</h2>
		<dl class="mt-6 space-y-4 text-sm">
			<div>
				<dt class="font-medium text-muted-foreground">ID</dt>
				<dd class="mt-1 font-mono text-base">{user.id}</dd>
			</div>
			<div>
				<dt class="font-medium text-muted-foreground">Imię i nazwisko</dt>
				<dd class="mt-1 text-base">{user.name}</dd>
			</div>
			<div>
				<dt class="font-medium text-muted-foreground">E-mail</dt>
				<dd class="mt-1 text-base">{user.email}</dd>
			</div>
			<div>
				<dt class="font-medium text-muted-foreground">Utworzono</dt>
				<dd class="mt-1 text-base">{formatDateTimePl(user.created_at)}</dd>
			</div>
		</dl>
		<div class="mt-8 flex justify-end">
			<Button variant="outline" onclick={close}>Zamknij</Button>
		</div>
	{/if}
</dialog>
