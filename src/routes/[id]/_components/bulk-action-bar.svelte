<script>
	import Button from '$lib/components/ui/button.svelte';
	import { STATUS_OPTIONS } from '$lib/task-status';
	import { CheckSquare } from '@lucide/svelte';

	let {
		count = 0,
		onClearSelection = () => {},
		onStatusChange = () => {}
	} = $props();
</script>

{#if count > 0}
	<div
		class="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm sm:flex-row sm:items-start sm:justify-between lg:items-center"
	>
		<div class="flex min-w-0 items-center gap-3">
			<CheckSquare class="size-4 shrink-0 text-primary" />
			<span class="font-medium text-primary">Zaznaczono: {count}</span>
		</div>
		<div class="flex min-w-0 flex-col gap-2 sm:items-end lg:flex-row lg:items-center lg:gap-2">
			<span class="shrink-0 text-muted-foreground">Zmień status na:</span>
			<div
				class="flex w-full flex-wrap gap-2 sm:justify-end md:w-auto md:flex-nowrap md:overflow-x-auto md:pb-0.5 lg:flex-wrap lg:overflow-visible"
			>
				{#each STATUS_OPTIONS as option (option.value)}
					<Button
						variant="outline"
						size="sm"
						class="shrink-0"
						onclick={() => onStatusChange(option.value)}
					>
						{option.label}
					</Button>
				{/each}
				<Button variant="ghost" size="sm" class="shrink-0" onclick={onClearSelection}>Odznacz</Button>
			</div>
		</div>
	</div>
{/if}
