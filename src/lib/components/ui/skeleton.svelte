<script>
	import { cn } from '$lib/ui/utils';

	let { class: className = '', ...restProps } = $props();
</script>

<div class={cn('animate-pulse rounded-md bg-muted', className)} {...restProps}></div>
