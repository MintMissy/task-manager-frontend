<script>
	import Button from '$lib/components/ui/button.svelte';
	import { dismissToast, toastStore } from '$lib/toast.svelte';
	import { CheckCircle2, CircleAlert, Info, X } from '@lucide/svelte';

	const toneClasses = {
		default: 'border-border/70 bg-card text-card-foreground',
		success:
			'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-50',
		destructive: 'border-destructive/20 bg-destructive/10 text-foreground'
	};

	const iconMap = {
		default: Info,
		success: CheckCircle2,
		destructive: CircleAlert
	};
</script>

<div
	class="pointer-events-none fixed top-4 right-4 z-50 flex w-[min(26rem,calc(100vw-2rem))] flex-col gap-3"
	aria-live="polite"
	aria-atomic="false"
>
	{#each toastStore.items as item (item.id)}
		{@const Icon = iconMap[item.variant] ?? iconMap.default}

		<div
			class={`pointer-events-auto rounded-2xl border p-4 shadow-lg backdrop-blur ${toneClasses[item.variant] ?? toneClasses.default}`}
		>
			<div class="flex items-start gap-3">
				<div class="mt-0.5 rounded-full bg-background/70 p-2">
					<Icon class="size-4" />
				</div>

				<div class="min-w-0 flex-1">
					<p class="text-sm font-semibold">{item.title}</p>

					{#if item.description}
						<p class="mt-1 text-sm text-muted-foreground">{item.description}</p>
					{/if}
				</div>

				<Button
					variant="ghost"
					size="icon"
					class="size-8 rounded-full"
					aria-label="Zamknij powiadomienie"
					onclick={() => dismissToast(item.id)}
				>
					<X class="size-4" />
				</Button>
			</div>
		</div>
	{/each}
</div>
