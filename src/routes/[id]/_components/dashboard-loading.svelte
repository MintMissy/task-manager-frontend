<script>
	import Card from '$lib/components/ui/card.svelte';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
</script>

<section class="grid gap-6">
	<Card class="p-5">
		<Skeleton class="h-12 w-full" />
		<Skeleton class="mt-5 h-24 w-full" />
		<Skeleton class="mt-4 h-24 w-full" />
	</Card>
</section>
