# Task Manager Frontend

SvelteKit frontend for the task manager backend API. The app ships a dashboard-oriented UI that loads tasks, users, and projects from the Express backend and exposes task CRUD flows through a shadcn-svelte-inspired component layer.

## Features

- Dashboard landing page with KPI cards for total, todo, in progress, and done tasks
- Filterable task workspace with search, status, project, and assignee filters
- Dual task presentation modes: list view and status-board view
- Create and edit task modal mapped to the backend task payload
- Delete confirmation flow with toast feedback
- Project and assignee side summaries for quick filtering
- Loading skeletons, empty states, and backend error handling

## Backend Contract

The frontend expects the backend API to expose:

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`
- `GET /users`
- `GET /projects`

Default API base URL:

```text
http://localhost:3000
```

You can override it with:

```text
PUBLIC_API_BASE_URL=http://localhost:3000
```

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create a local env file:

```bash
cp .env.example .env
```

Start the frontend:

```bash
pnpm dev
```

The backend should be running separately in the task manager backend project.

## Scripts

- `pnpm dev` starts the local dev server
- `pnpm build` creates the production build
- `pnpm preview` previews the production build
- `pnpm lint` runs Prettier and ESLint
- `pnpm format` formats the repository

## UI Structure

Main route:

- `/` renders the task dashboard

Primary UI sections:

- hero header with refresh and create actions
- KPI summary cards
- filter bar and list/board toggle
- task list or Kanban-style status board
- project and assignee summary panels

## Notes

- The frontend reads from the joined task payload returned by `GET /tasks`, including `assigned_user_name` and `project_name`.
- Create and update actions refresh the task collection after success so the joined display fields stay accurate.
- Status handling is intentionally limited to the backend values: `todo`, `in_progress`, and `done`.

## Implementation Reference

Detailed frontend implementation notes live in [ui-implementation-plan.md](./ui-implementation-plan.md).
