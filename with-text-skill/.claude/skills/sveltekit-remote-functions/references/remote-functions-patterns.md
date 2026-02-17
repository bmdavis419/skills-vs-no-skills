# Remote Functions Patterns

Use this reference after reading `SKILL.md`.

## 1. Minimal Setup

```ts
// svelte.config.ts
import adapter from '@sveltejs/adapter-auto';

/** @type {import("@sveltejs/kit").Config} */
const config = {
	kit: {
		adapter,
		experimental: {
			remoteFunctions: true
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
```

## 2. Query Pattern

Use `query` for dynamic reads. Validate inputs when arguments exist.

```ts
// data.remote.ts
import * as v from 'valibot';
import { query } from '$app/server';
import * as db from '$lib/server/database';

export const getPost = query(v.string(), async (slug) => {
	const [post] = await db.sql`SELECT title, content FROM post WHERE slug = ${slug}`;
	return post;
});
```

## 3. Query Batch Pattern

Use `query.batch` for fan-out reads in one macrotask.

```ts
import * as v from 'valibot';
import { query } from '$app/server';
import * as db from '$lib/server/database';

export const getWeather = query.batch(v.string(), async (cityIds) => {
	const rows = await db.sql`SELECT city_id, temp FROM weather WHERE city_id IN ${cityIds}`;
	const byId = new Map(rows.map((r) => [r.city_id, r]));
	return (cityId) => byId.get(cityId) ?? null;
});
```

## 4. Form Pattern

Use `form` for write operations that should progressively enhance `<form>` submissions.

```ts
import * as v from 'valibot';
import { form } from '$app/server';
import { getPosts } from './data.remote';

export const createPost = form(
	v.object({
		title: v.pipe(v.string(), v.nonEmpty()),
		content: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ title, content }) => {
		// write to db
		await getPosts().refresh();
		return { success: true };
	}
);
```

For sensitive fields, use a leading underscore in the field name (example: `_password`).

## 5. Command Pattern

Use `command` for imperative event-driven writes. Do not call commands during render.

```ts
import * as v from 'valibot';
import { command } from '$app/server';
import { getLikes } from './likes.remote';

export const addLike = command(v.string(), async (id) => {
	// write to db
	await getLikes(id).refresh();
});
```

Client usage with targeted updates:

```ts
await addLike(item.id).updates(getLikes(item.id));
```

## 6. Prerender Pattern

Use `prerender` for deployment-stable data.

```ts
import * as v from 'valibot';
import { prerender } from '$app/server';

export const getPost = prerender(
	v.string(),
	async (slug) => {
		// read from db/cms
		return { slug };
	},
	{
		inputs: () => ['first-post', 'second-post']
	}
);
```

If runtime non-prerendered args are required, set `{ dynamic: true }`.

## 7. Validation Failure Handling

Customize the default generic 400 message with `handleValidationError`:

```ts
// src/hooks.server.ts
import type { HandleValidationError } from '@sveltejs/kit';

export const handleValidationError: HandleValidationError = ({ event, issues }) => {
	return { message: 'Bad request' };
};
```

Use `'unchecked'` only if you intentionally skip validation:

```ts
import { query } from '$app/server';

export const getStuff = query('unchecked', async (arg: { id: string }) => {
	return arg.id;
});
```

## 8. getRequestEvent Caveats

- Access `getRequestEvent` inside `query`, `form`, and `command`.
- In environments without `AsyncLocalStorage`, call it synchronously (before `await`).
- Treat `route`, `params`, and `url` carefully; do not use them for authorization decisions in remote handlers.

## 9. Redirect Rule

- `redirect(...)` is valid in `query`, `form`, and `prerender`.
- Do not redirect directly in `command`; return intent and navigate on the client.
