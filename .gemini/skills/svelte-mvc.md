---
name: svelte-mvc
description: You are a Svelte MVC Architect Agent. Your primary function is to generate or refactor Svelte frontend code into a strict Model-View-Controller (MVC) architecture that communicates with a Node.js/Express backend, using Svelte 5 `$state` runes and Dependency Injection (Context API) to prevent SSR state leaks.
---

# Model-View-Controller (MVC)

## Architectural Rules

When given a feature request or existing Svelte code, you MUST separate the logic into three distinct layers using Svelte 5 Context dependency injection:

1.  **The Model (`[feature]Model.svelte.js`)**:
    - Must be an exported class that stores reactive state in class properties using the `$state` rune.
    - Must encapsulate ALL data fetching (e.g., `fetch` calls to the Express backend) and data mutations.
    - Must provide `set[Feature]Model()` and `get[Feature]Model()` helpers using Svelte's `setContext` and `getContext`.
    - Must not import or rely on UI components.
2.  **The Controller (`[feature]Controller.svelte.js`)**:
    - Must be an exported class that accepts a Model instance via its constructor.
    - Must act as the intermediary between the View and the Model.
    - Must contain all business logic, data validation, and event handling.
    - Must instruct the Model to update data based on user interactions.
    - Must provide `set[Feature]Controller()` and `get[Feature]Controller()` helpers.
    - Must not contain any HTML, CSS, or UI rendering logic.
3.  **The View (`[Feature]View.svelte`)**:
    - Must retrieve the model and controller instances using `get[Feature]Model()` and `get[Feature]Controller()` (or initialize them with `setContext` if it's the root route component).
    - Must contain ZERO business logic or API calls.
    - Must delegate all user events (clicks, inputs, initializations) directly to the Controller.

## Examples

### todoModel.svelte.js

```javascript
import { setContext, getContext } from 'svelte';

const MODEL_KEY = Symbol('todoModel');

export function setTodoModel() {
	return setContext(MODEL_KEY, new TodoModel());
}

export function getTodoModel() {
	return getContext(MODEL_KEY);
}

export class TodoModel {
	todos = $state([]);
	loading = $state(false);

	async loadTodos() {
		this.loading = true;
		const response = await fetch('/api/todos');
		this.todos = await response.json();
		this.loading = false;
	}

	async createTodo(text) {
		const newTodo = { id: Date.now(), text, completed: false };
		this.todos.push(newTodo);
	}
}
```

### todoController.svelte.js

```javascript
import { setContext, getContext } from 'svelte';

const CTRL_KEY = Symbol('todoController');

export function setTodoController(model) {
	return setContext(CTRL_KEY, new TodoController(model));
}

export function getTodoController() {
	return getContext(CTRL_KEY);
}

export class TodoController {
	model = null;

	constructor(model) {
		this.model = model;
	}

	onInitialize() {
		this.model.loadTodos();
	}

	handleAddTodo(text) {
		const sanitizedText = text.trim();
		if (!sanitizedText) return;
		this.model.createTodo(sanitizedText);
	}
}
```

### TodoView.svelte (Root Component initializing context)

```svelte
<script>
	import { setTodoModel } from './todoModel.svelte.js';
	import { setTodoController } from './todoController.svelte.js';

	// 1. Initialize instances in the root component for this route
	const model = setTodoModel();
	const controller = setTodoController(model);

	let inputText = $state('');

	$effect.pre(() => {
		controller.onInitialize();
	});

	function submitTodo() {
		controller.handleAddTodo(inputText);
		inputText = '';
	}
</script>

<main>
	{#if model.loading}
		<p>Loading...</p>
	{:else}
		<ul>
			{#each model.todos as todo (todo.id)}
				<li>{todo.text}</li>
			{/each}
		</ul>
	{/if}
	<input type="text" bind:value={inputText} />
	<button onclick={submitTodo}>Add</button>
</main>
```

### ChildView.svelte (Child Component reading context)

```svelte
<script>
	import { getTodoModel } from './todoModel.svelte.js';
	import { getTodoController } from './todoController.svelte.js';

	// 1. Retrieve existing instances from context
	const model = getTodoModel();
	const controller = getTodoController();
</script>

<!-- Just bind and read from the model as normal -->
```
