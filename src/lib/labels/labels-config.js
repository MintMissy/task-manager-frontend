export const LABEL_COLORS = [
	{ value: 'slate', bg: 'bg-slate-500', text: 'text-white', ring: 'ring-slate-500' },
	{ value: 'red', bg: 'bg-red-500', text: 'text-white', ring: 'ring-red-500' },
	{ value: 'orange', bg: 'bg-orange-500', text: 'text-white', ring: 'ring-orange-500' },
	{ value: 'amber', bg: 'bg-amber-400', text: 'text-black', ring: 'ring-amber-400' },
	{ value: 'green', bg: 'bg-green-500', text: 'text-white', ring: 'ring-green-500' },
	{ value: 'teal', bg: 'bg-teal-500', text: 'text-white', ring: 'ring-teal-500' },
	{ value: 'cyan', bg: 'bg-cyan-500', text: 'text-white', ring: 'ring-cyan-500' },
	{ value: 'blue', bg: 'bg-blue-500', text: 'text-white', ring: 'ring-blue-500' },
	{ value: 'indigo', bg: 'bg-indigo-500', text: 'text-white', ring: 'ring-indigo-500' },
	{ value: 'violet', bg: 'bg-violet-500', text: 'text-white', ring: 'ring-violet-500' },
	{ value: 'pink', bg: 'bg-pink-500', text: 'text-white', ring: 'ring-pink-500' },
	{ value: 'rose', bg: 'bg-rose-500', text: 'text-white', ring: 'ring-rose-500' },
];

export const LABEL_ICONS = [
	'tag', 'bug', 'star', 'flame', 'zap', 'shield', 'target', 'flag',
	'bookmark', 'lightbulb', 'rocket', 'heart', 'triangle-alert', 'circle-check',
	'clock', 'code', 'database', 'globe', 'lock', 'settings'
];

export function getLabelColor(colorValue) {
	return LABEL_COLORS.find((c) => c.value === colorValue) ?? LABEL_COLORS[7];
}
