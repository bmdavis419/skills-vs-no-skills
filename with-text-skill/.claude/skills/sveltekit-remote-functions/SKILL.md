---
name: sveltekit-remote-functions
description: Build, refactor, and review SvelteKit Remote Functions for type-safe client-server communication in `.remote.ts`/`.remote.js` modules. Use when implementing or debugging `query`, `query.batch`, `form`, `command`, `prerender`, schema validation, optimistic/single-flight updates, `handleValidationError`, `getRequestEvent`, or redirect behavior.
---

# SvelteKit Remote Functions

Implement remote functions with correct validation, rendering behavior, and refresh strategy. Keep server-only work in remote handlers and choose the right function type for each read/write flow.

## Start

1. Verify project prerequisites.

- Ensure SvelteKit supports the feature (`query`/`form`/`command`/`prerender` are available since 2.27; `query.batch` is documented since 2.35).
- Enable `kit.experimental.remoteFunctions: true` in `svelte.config`.
- Enable `compilerOptions.experimental.async: true` when using `await` directly in components.

2. Choose the right remote function.

- Use `query` for dynamic reads.
- Use `query.batch` to batch fan-out reads in the same macrotask and prevent n+1 patterns.
- Use `form` for mutations tied to `<form>` behavior (works without JavaScript, progressive enhancement when JS exists).
- Use `command` for imperative mutations not tied to a form element.
- Use `prerender` for data that changes at most once per deployment.

3. Validate input using a Standard Schema library.

- Prefer Zod or Valibot schemas.
- Use `'unchecked'` only when you intentionally accept runtime risk.

4. Decide update strategy after mutations.

- Default `form` behavior refreshes active queries and `load` data.
- Use single-flight updates to avoid extra round-trips: `query().refresh()`, `query().set()`, `submit().updates(...)`, or `commandCall.updates(...)`.
- Use `withOverride(...)` for optimistic UI.

## Rules

- Define remote handlers in `.remote.ts`/`.remote.js` files under `src`, not `src/lib/server`.
- Keep sensitive server logic in handler bodies or private server modules.
- Prefer `form` over `command` when no-JS fallback matters.
- Do not call commands during render.
- Prefix sensitive form fields with `_` so invalid non-enhanced submissions do not repopulate secrets.
- Add `inputs` for argumented `prerender` functions; use `{ dynamic: true }` only when required.
- Use `getRequestEvent` in `query`/`form`/`command` as needed, but never rely on `route`/`params`/`url` there for authorization decisions.
- Use `redirect(...)` only in `query`, `form`, or `prerender`. In `command`, return redirect intent and handle it client-side.

## Debug

- Remote call fails immediately.
- Check feature flags and SvelteKit version first.
- Validation fails unexpectedly.
- Compare caller payload with schema, then check deployment skew and `handleValidationError` in `src/hooks.server`.
- Mutation causes too much refetching.
- Replace default invalidation with targeted single-flight updates.
- Command succeeds but UI is stale.
- Refresh or set the relevant query explicitly.

## References

- `references/remote-functions-patterns.md`
- https://svelte.dev/docs/kit/remote-functions
