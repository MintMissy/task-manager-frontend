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
	<div class="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
		<CheckSquare class="size-4 shrink-0 text-primary" />
		<span class="font-medium text-primary">Zaznaczono: {count}</span>
		<div class="ml-auto flex items-center gap-2">
			<span class="text-muted-foreground">Zmień status na:</span>
			{#each STATUS_OPTIONS as option (option.value)}
				<Button
					variant="outline"
					size="sm"
					onclick={() => onStatusChange(option.value)}
				>
					{option.label}
				</Button>
			{/each}
			<Button variant="ghost" size="sm" onclick={onClearSelection}>Odznacz</Button>
		</div>
	</div>
{/if}
