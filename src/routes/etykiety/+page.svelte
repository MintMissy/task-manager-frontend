<script>
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { getErrorMessage } from '$lib/errors';
	import { getLabelColor, LABEL_COLORS, LABEL_ICONS } from '$lib/label-config';
	import { createLabel, deleteLabel, updateLabel } from '$lib/task-api';
	import { toast } from '$lib/toast.svelte';
	import { fieldClass } from '$lib/utils';
	import { Pencil, Plus, Tag, Trash2 } from '@lucide/svelte';
	import * as LucideIcons from '@lucide/svelte';

	let { data } = $props();
	let labels = $derived(data.labels ?? []);

	let editingId = $state(null);
	let showForm = $state(false);
	let formName = $state('');
	let formColor = $state('blue');
	let formIcon = $state('tag');
	let formError = $state('');
	let submitting = $state(false);

	function openCreate() {
		editingId = null;
		formName = '';
		formColor = 'blue';
		formIcon = 'tag';
		formError = '';
		showForm = true;
	}

	function openEdit(label) {
		editingId = label.id;
		formName = label.name;
		formColor = label.color;
		formIcon = label.icon;
		formError = '';
		showForm = true;
	}

	function cancelForm() {
		showForm = false;
		editingId = null;
		formError = '';
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (!formName.trim()) { formError = 'Nazwa jest wymagana.'; return; }
		submitting = true;
		formError = '';
		try {
			if (editingId) {
				await updateLabel(editingId, { name: formName.trim(), color: formColor, icon: formIcon });
				toast({ title: 'Zaktualizowano etykietę', variant: 'success' });
			} else {
				await createLabel({ name: formName.trim(), color: formColor, icon: formIcon });
				toast({ title: 'Dodano etykietę', variant: 'success' });
			}
			showForm = false;
			editingId = null;
			await invalidateAll();
		} catch (err) {
			formError = getErrorMessage(err);
		} finally {
			submitting = false;
		}
	}

	async function handleDelete(label) {
		if (!confirm(`Usunąć etykietę "${label.name}"? Zostanie odpięta od wszystkich zadań.`)) return;
		try {
			await deleteLabel(label.id);
			toast({ title: 'Usunięto etykietę', variant: 'success' });
			await invalidateAll();
		} catch (err) {
			toast({ title: 'Błąd', description: getErrorMessage(err), variant: 'destructive' });
		}
	}

	function getIconComponent(name) {
		const key = name
			?.split('-')
			.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
			.join('');
		return LucideIcons[key] ?? LucideIcons['Tag'];
	}
</script>

<svelte:head>
	<title>Etykiety — Task Manager</title>
	<meta name="description" content="Zarządzaj globalnymi etykietami zadań." />
</svelte:head>

<div class="space-y-8 pb-12">
	<div class="flex items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold">Etykiety</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Globalne etykiety dostępne we wszystkich projektach.
			</p>
		</div>
		<Button onclick={openCreate}>
			<Plus class="size-4" />
			Nowa etykieta
		</Button>
	</div>

	{#if showForm}
		<Card class="p-6">
			<h2 class="mb-5 text-lg font-semibold">{editingId ? 'Edytuj etykietę' : 'Nowa etykieta'}</h2>
			<form onsubmit={handleSubmit} class="space-y-5">
				<div class="space-y-2">
					<label for="label-name" class="text-sm font-medium">Nazwa</label>
					<input id="label-name" class={fieldClass} type="text" placeholder="Np. Bug, Feature, Pilne" bind:value={formName} />
				</div>

				<div class="space-y-2">
					<p class="text-sm font-medium">Kolor</p>
					<div class="flex flex-wrap gap-2">
						{#each LABEL_COLORS as c (c.value)}
							<button
								type="button"
								class="h-7 w-7 rounded-full {c.bg} transition-transform hover:scale-110 {formColor === c.value ? 'ring-2 ring-offset-2 ' + c.ring : ''}"
								onclick={() => (formColor = c.value)}
								title={c.value}
							></button>
						{/each}
					</div>
				</div>

				<div class="space-y-2">
					<p class="text-sm font-medium">Ikona</p>
					<div class="flex flex-wrap gap-2">
						{#each LABEL_ICONS as iconName (iconName)}
							{@const IconComp = getIconComponent(iconName)}
							<button
								type="button"
								class="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors {formIcon === iconName ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 hover:bg-muted/60'}"
								onclick={() => (formIcon = iconName)}
								title={iconName}
							>
								<IconComp class="size-4" />
							</button>
						{/each}
					</div>
				</div>

				{#if formError}
					<p class="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm">{formError}</p>
				{/if}

				<div class="flex justify-end gap-3">
					<Button variant="outline" type="button" onclick={cancelForm}>Anuluj</Button>
					<Button type="submit" disabled={submitting}>
						{submitting ? 'Zapisywanie...' : editingId ? 'Zapisz zmiany' : 'Utwórz etykietę'}
					</Button>
				</div>
			</form>
		</Card>
	{/if}

	{#if labels.length === 0}
		<Card class="px-6 py-12 text-center text-muted-foreground">
			<Tag class="mx-auto mb-3 size-10 opacity-30" />
			<p class="font-medium">Brak etykiet</p>
			<p class="mt-1 text-sm">Kliknij "Nowa etykieta", aby dodać pierwszą.</p>
		</Card>
	{:else}
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each labels as label (label.id)}
				{@const colorMeta = getLabelColor(label.color)}
				{@const IconComp = getIconComponent(label.icon)}
				<Card class="flex items-center gap-4 p-4">
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full {colorMeta.bg} {colorMeta.text}">
						<IconComp class="size-5" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="font-semibold">{label.name}</p>
						<p class="text-xs text-muted-foreground">{label.color} · {label.icon}</p>
					</div>
					<div class="flex gap-1">
						<Button variant="ghost" size="sm" onclick={() => openEdit(label)}>
							<Pencil class="size-4" />
						</Button>
						<Button variant="ghost" size="sm" class="text-destructive hover:bg-destructive/10 hover:text-destructive" onclick={() => handleDelete(label)}>
							<Trash2 class="size-4" />
						</Button>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
