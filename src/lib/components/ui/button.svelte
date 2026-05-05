<script>
	import { cn } from '$lib/utils';

	const variants = {
		default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
		secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
		outline:
			'border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		destructive: 'bg-destructive text-white shadow-sm hover:bg-destructive/90',
		success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500'
	};

	const sizes = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'size-10'
	};

	let {
		variant = 'default',
		size = 'default',
		class: className = '',
		type = 'button',
		disabled = false,
		children,
		...restProps
	} = $props();
</script>

<button
	{type}
	{disabled}
	class={cn(
		'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
		variants[variant] ?? variants.default,
		sizes[size] ?? sizes.default,
		className
	)}
	{...restProps}
>
	{@render children?.()}
</button>
