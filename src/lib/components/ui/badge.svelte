<script>
	import { cn } from '$lib/ui/utils';

	const variants = {
		default: 'bg-primary/10 text-primary',
		muted: 'bg-muted text-muted-foreground',
		warning: 'bg-amber-100 text-amber-950 dark:bg-amber-500/20 dark:text-amber-100',
		success: 'bg-emerald-100 text-emerald-950 dark:bg-emerald-500/20 dark:text-emerald-100',
		destructive: 'bg-destructive/10 text-destructive'
	};

	let { variant = 'default', class: className = '', children, ...restProps } = $props();
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide',
		variants[variant] ?? variants.default,
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>
