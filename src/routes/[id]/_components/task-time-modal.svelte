<script>
	import Button from '$lib/components/ui/button.svelte';
	import { syncModalOpen } from '$lib/dialog-sync';
	import { fieldClass } from '$lib/utils';
	import { fetchTimeLogs, createTimeLog, deleteTimeLog } from '$lib/task-api';
	import { getErrorMessage } from '$lib/errors';
	import { toast } from '$lib/toast.svelte';
	import { Trash2 } from '@lucide/svelte';

	let {
		open = false,
		task = null,
		onClose = () => {},
		onTimeLogged = () => {}
	} = $props();

	let dialogEl = $state();
	let loading = $state(false);
	let submitting = $state(false);
	let logs = $state([]);
	let fetchError = $state('');
	
	let formHours = $state('');
	let formComment = $state('');
	let clientError = $state('');

	$effect.pre(() => {
		if (open && task) {
			loadLogs();
			formHours = '';
			formComment = '';
			clientError = '';
		}
	});

	$effect(() => {
		syncModalOpen(dialogEl, open);
	});

	async function loadLogs() {
		loading = true;
		fetchError = '';
		try {
			logs = await fetchTimeLogs(task.id);
		} catch (error) {
			fetchError = getErrorMessage(error);
		} finally {
			loading = false;
		}
	}

	async function handleAddLog(event) {
		event.preventDefault();
		const h = Number(formHours);
		if (!h || isNaN(h) || h <= 0) {
			clientError = 'Podaj poprawną liczbę godzin (np. 1.5).';
			return;
		}

		clientError = '';
		submitting = true;

		try {
			await createTimeLog(task.id, { hours: h, comment: formComment.trim() });
			toast({
				title: 'Zapisano czas',
				description: `Dodano ${h} h do zadania.`,
				variant: 'success'
			});
			formHours = '';
			formComment = '';
			await loadLogs();
			onTimeLogged();
		} catch (error) {
			clientError = getErrorMessage(error);
		} finally {
			submitting = false;
		}
	}

	async function handleDeleteLog(logId) {
		if (!confirm('Czy na pewno chcesz usunąć ten wpis? Czas zostanie odjęty.')) return;
		
		try {
			await deleteTimeLog(logId);
			toast({
				title: 'Usunięto wpis',
				description: 'Czas został zaktualizowany.',
				variant: 'success'
			});
			await loadLogs();
			onTimeLogged();
		} catch (error) {
			toast({
				title: 'Błąd usuwania',
				description: getErrorMessage(error),
				variant: 'destructive'
			});
		}
	}

	function formatDate(isoStr) {
		const d = new Date(isoStr);
		return d.toLocaleString('pl-PL', {
			day: '2-digit', month: '2-digit', year: 'numeric',
			hour: '2-digit', minute: '2-digit'
		});
	}
</script>

<dialog
	bind:this={dialogEl}
	class="fixed top-1/2 left-1/2 z-50 max-h-[min(calc(100vh-2rem),90dvh)] w-[min(100vw-2rem,36rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-2xl"
	aria-labelledby="time-modal-title"
	aria-modal="true"
	aria-hidden={!open}
	oncancel={(event) => {
		event.preventDefault();
		onClose();
	}}
>
	<div class="flex items-start justify-between gap-6">
		<div>
			<h2 id="time-modal-title" class="mt-2 text-2xl font-semibold text-balance">
				Czas pracy
			</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Zadanie: <strong class="text-foreground">{task?.title}</strong>
			</p>
		</div>
		<Button variant="ghost" class="rounded-full px-3" onclick={onClose}>Zamknij</Button>
	</div>

	<form class="mt-6 space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-5" onsubmit={handleAddLog}>
		<h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Dodaj wpis</h3>
		<div class="grid gap-4 sm:grid-cols-[8rem_1fr]">
			<div class="space-y-2">
				<label for="log-hours" class="text-sm font-medium">Ilość (h)</label>
				<input
					id="log-hours"
					class={fieldClass}
					type="number"
					step="0.25"
					min="0"
					placeholder="np. 2.5"
					bind:value={formHours}
				/>
			</div>
			<div class="space-y-2">
				<label for="log-comment" class="text-sm font-medium">Komentarz (opcjonalny)</label>
				<input
					id="log-comment"
					class={fieldClass}
					type="text"
					placeholder="np. Analiza bazy danych"
					bind:value={formComment}
				/>
			</div>
		</div>

		{#if clientError}
			<div class="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-foreground">
				{clientError}
			</div>
		{/if}

		<div class="flex justify-end pt-1">
			<Button type="submit" disabled={submitting}>
				{submitting ? 'Zapisywanie...' : 'Dodaj czas'}
			</Button>
		</div>
	</form>

	<div class="mt-8">
		<h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Historia wpisów</h3>
		
		{#if loading}
			<div class="py-6 text-center text-sm text-muted-foreground">Ładowanie...</div>
		{:else if fetchError}
			<div class="py-4 text-sm text-destructive">{fetchError}</div>
		{:else if logs.length === 0}
			<div class="rounded-2xl border border-dashed border-border/80 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
				Brak zarejestrowanego czasu dla tego zadania.
			</div>
		{:else}
			<div class="space-y-3">
				{#each logs as log (log.id)}
					<div class="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background p-4 shadow-sm">
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<span class="font-semibold text-primary">{log.hours} h</span>
								<span class="text-xs text-muted-foreground">{formatDate(log.created_at)}</span>
							</div>
							{#if log.comment}
								<p class="mt-1 text-sm text-foreground/90">{log.comment}</p>
							{/if}
						</div>
						<Button
							variant="ghost"
							size="sm"
							class="text-destructive hover:bg-destructive/10 hover:text-destructive"
							onclick={() => handleDeleteLog(log.id)}
						>
							<Trash2 class="size-4" />
						</Button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</dialog>
