<script>
	import Button from '$lib/components/ui/button.svelte';
	import { Plus, RefreshCcw } from '@lucide/svelte';

	let { refreshing = false, onRefresh = () => {}, onNewTask = () => {} } = $props();
</script>

<section
	class="rounded-[2rem] border border-border/60 bg-card/85 p-6 shadow-xl shadow-slate-950/5 backdrop-blur lg:p-8"
>
	<div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
		<div class="flex flex-col gap-3 sm:flex-row">
			<Button variant="outline" onclick={onRefresh} disabled={refreshing}>
				<RefreshCcw class={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
				{refreshing ? 'Odświeżanie…' : 'Odśwież dane'}
			</Button>
			<Button onclick={onNewTask}>
				<Plus class="size-4" />
				Nowe zadanie
			</Button>
		</div>
	</div>
</section>
