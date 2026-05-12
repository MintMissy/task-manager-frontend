<script>
	import { getLabelColor } from '$lib/label-config';
	import * as LucideIcons from '@lucide/svelte';

	let { label, size = 'sm' } = $props();

	const colorMeta = $derived(getLabelColor(label.color));
	const iconKey = $derived(
		label.icon
			?.split('-')
			.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
			.join('') ?? 'Tag'
	);
	const IconComp = $derived(LucideIcons[iconKey] ?? LucideIcons['Tag']);
</script>

<span
	class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium {colorMeta.bg} {colorMeta.text}"
>
	<IconComp class="size-3 shrink-0" />
	{label.name}
</span>
