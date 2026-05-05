<script>
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';

	let { onResetFilters = () => {} } = $props();
</script>

<Card class="p-8 text-center">
	<p class="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">Brak wyników</p>
	<h2 class="mt-3 text-3xl font-semibold text-balance">Żadne zadanie nie pasuje do filtrów.</h2>
	<div class="mt-3 flex justify-center">
		<Button variant="outline" onclick={onResetFilters}>Resetuj filtry</Button>
	</div>
</Card>
