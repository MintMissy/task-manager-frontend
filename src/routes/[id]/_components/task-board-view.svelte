<script>
	import TaskBoardColumn from './task-board-column.svelte';

	let { columns = [], onEditTask = () => {}, onDeleteTask = () => {}, onLogTimeTask = () => {} } = $props();
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
	{#each columns as column (column.value)}
		<TaskBoardColumn {column} {onEditTask} {onDeleteTask} {onLogTimeTask} />
	{/each}
</div>