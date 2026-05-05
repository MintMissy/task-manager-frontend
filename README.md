# Task Manager Frontend

SvelteKit 5 app. Shared primitives: `src/lib/components/ui/`. Route-scoped UI: `src/routes/.../_components/`.

## Scope

- **`/`** — project picker; sidebar lists projects + “Dodaj listę”.
- **`/:id`** — single-project task workspace: toolbar, `q` + `assignee` URL params (shareable), list/Kanban, task CRUD (modals, confirm, toasts).
- **`/uzytkownicy`** — users table; view/create/edit/delete modals.

States: skeletons, empty, no-results, error + retry. Task rows use API-joined fields (`assigned_user_name`, `project_name`).

## Local setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Set `PUBLIC_API_BASE_URL` (default in `.env.example`: `http://localhost:3000`) to a running API instance.

## Project layout

| Path                                      | Role                                          |
| ----------------------------------------- | --------------------------------------------- |
| `src/routes/+layout.svelte`               | Shell: sidebar, new-list flow, toast viewport |
| `src/routes/+layout.js`                   | Loads tasks, users, projects                  |
| `src/routes/+page.svelte`                 | Home / project selection                      |
| `src/routes/[id]/+page.svelte`            | Task dashboard                                |
| `src/routes/[id]/_components/`            | Task-only components                          |
| `src/routes/uzytkownicy/`                 | Users page + `_components/`                   |
| `src/lib/components/ui/`                  | Shared UI primitives                          |
| `src/lib/task-api.js`                     | HTTP client                                   |
| `src/lib/task-status.js`, `task-dates.js` | Status labels, dates                          |
