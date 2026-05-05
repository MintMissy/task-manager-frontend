<script>
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { Plus } from '@lucide/svelte';

	let { onCreateTask = () => {} } = $props();
</script>

<Card class="p-8 text-center">
	<p class="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">Pusta lista</p>
	<h2 class="mt-3 text-3xl font-semibold text-balance">Brak zadań na tej liście.</h2>
	<p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
		Backend zwrócił pustą listę zadań. Utwórz pierwsze zadanie, aby rozpocząć pracę.
	</p>
	<div class="mt-6 flex justify-center">
		<Button onclick={onCreateTask}>
			<Plus class="size-4" />
			Utwórz pierwsze zadanie
		</Button>
	</div>
</Card>
