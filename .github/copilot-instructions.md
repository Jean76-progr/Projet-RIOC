<!-- Project-specific Copilot instructions for contributors and AI agents -->
# Guidance for AI coding assistants

This repo is a small React + TypeScript + Vite app (fast HMR). Focus on making safe, minimal changes, and prefer small incremental edits.

Key points an AI should know before editing:

- Project entry: `src/main.tsx` renders `App` (`src/App.tsx`). Use these when adding global providers or routes.
- Component layout: `src/components/` contains feature folders: `Canvas`, `CodeEditor`, `DraggableElement`, `Sidebar`, `ToolBar`. Files may be added to these feature folders — follow the existing folder-per-feature pattern.
- Build & run scripts: see `package.json`.
  - `npm run dev` — start Vite dev server with HMR.
  - `npm run build` — runs `tsc -b` then `vite build`.
  - `npm run preview` — preview production build.

- TypeScript: The project uses `tsconfig.app.json` and `tsconfig.node.json` (referenced from `tsconfig.json`). Keep new files TypeScript-safe and prefer explicit types for exported module boundaries.

- State & persistence patterns:
  - Zustand (v5) is used for local app state. Look for stores named `use*Store` and follow their shape when extending state.
  - Dexie + `dexie-react-hooks` is used for client-side persistent storage. When adding DB schema changes, update the Dexie instance (usually in a `db` file) and bump migrations carefully.

- Editor & drag interactions:
  - `@monaco-editor/react` is used for code editing components.
  - `@dnd-kit/*` powers drag-and-drop. Follow existing patterns for sensors and sortable items.

- Styling: Tailwind is present (v4). Global styles live in `src/index.css` and `src/App.css`. Prefer utility classes for small changes; add CSS modules or scoped CSS only if necessary.

- ESLint & formatting:
  - Run `npm run lint` to check lint issues. The repo uses ESLint configs in `eslint.config.js`.

Patterns and examples to reference when editing:

- When adding a new component folder, include an index file that exports the main component and its types. Example structure:
  - `src/components/Foo/Foo.tsx`
  - `src/components/Foo/index.ts`

- When interacting with global state, import the store hook (e.g. `useAppStore`) rather than passing large prop-trees.

- Persisted data must go through the Dexie wrapper — don't read/write IndexedDB directly unless adding low-level DB code.

What NOT to do:

- Do not change build scripts or major dependency versions in bulk. Propose changes instead via an issue/PR.
- Avoid introducing global CSS that conflicts with Tailwind utilities.

Where to add tests and quick checks:

- There's no test runner configured. For small changes, run the dev server and manually verify UI behavior.

Editing safety checks for AI-generated PRs:

1. Keep changes small and focused (single feature or bugfix per PR).
2. Run `npm run lint` locally and ensure TypeScript compiles (`tsc -b`).
3. If adding or modifying DB schema, include migration notes in the PR description.

Files and folders to inspect for context when asked to make changes:

- `package.json` — scripts and deps
- `vite.config.ts` — Vite plugin usage
- `src/main.tsx`, `src/App.tsx` — app entry and root render
- `src/components/*` — feature components
- `src/assets/` — static assets like `vite.svg` and `react.svg`

If anything in these instructions is unclear or you'd like a different level of detail (e.g., store locations, DB code, or common utility files), tell me which area to expand and I'll iterate.
