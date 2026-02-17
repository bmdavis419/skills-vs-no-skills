import { command, form, query } from '$app/server';
import * as v from 'valibot';

interface Todo {
	id: string;
	text: string;
	completed: boolean;
}

const todos: Todo[] = [];

export const getTodos = query(async () => todos);

export const createTodo = form(
	v.object({ text: v.pipe(v.string(), v.nonEmpty()) }),
	async ({ text }) => {
		todos.push({ id: crypto.randomUUID(), text, completed: false });

		await getTodos().refresh();
	}
);

export const deleteTodo = command(v.string(), async (id) => {
	const index = todos.findIndex((t) => t.id === id);
	if (index !== -1) todos.splice(index, 1);

	await getTodos().refresh();
});

export const completeTodo = command(v.string(), async (id) => {
	const todo = todos.find((t) => t.id === id);
	if (todo) todo.completed = true;

	await getTodos().refresh();
});
