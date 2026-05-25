<script>
	import { cn } from '$lib/ui/utils';

	let { class: className = '', children, ...restProps } = $props();
</script>

<div
	class={cn(
		'rounded-2xl border border-border/70 bg-card text-card-foreground shadow-sm',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
