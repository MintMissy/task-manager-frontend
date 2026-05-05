<script>
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { CircleAlert } from '@lucide/svelte';

	let { message = '', onRetry = () => {} } = $props();
</script>

<Card class="border-destructive/20 bg-destructive/5 p-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div class="flex items-start gap-3">
			<div class="rounded-full bg-destructive/10 p-3 text-destructive">
				<CircleAlert class="size-5" />
			</div>

			<div>
				<h2 class="text-left text-2xl font-semibold">Nie udało się wczytać panelu</h2>
				<p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{message}</p>
				<p class="mt-2 text-sm text-muted-foreground">
					Uruchom backend i upewnij się, że `PUBLIC_API_BASE_URL` wskazuje działające API.
				</p>
			</div>
		</div>

		<Button onclick={onRetry}>Spróbuj ponownie</Button>
	</div>
</Card>
