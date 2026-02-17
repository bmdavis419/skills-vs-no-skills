<script lang="ts">
	import { completeTodo, createTodo, deleteTodo, getTodos } from '$lib/remote/todos.remote';

	const todos = $derived(await getTodos());

	$inspect(todos);
</script>

<div class="mx-auto max-w-lg px-4 py-10">
	<h1 class="mb-6 text-2xl font-bold">Todos</h1>

	<form
		{...createTodo.enhance(async ({ submit, form }) => {
			await submit();
			form.reset();
		})}
		class="mb-8 flex gap-2"
	>
		<input
			{...createTodo.fields.text.as('text')}
			placeholder="New todo..."
			class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
		/>
		{#each createTodo.fields.text.issues() as issue}
			<p class="mt-1 text-xs text-red-500">{issue.message}</p>
		{/each}
		<button
			type="submit"
			class="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
		>
			Add
		</button>
	</form>

	<ul class="space-y-2">
		{#each todos as todo (todo.id)}
			<li class="flex items-center gap-3 rounded border border-gray-200 px-4 py-3">
				<button
					onclick={() => completeTodo(todo.id)}
					disabled={todo.completed}
					class="size-5 shrink-0 rounded-full border-2 border-amber-500 disabled:border-green-500 disabled:bg-green-500"
					aria-label="Complete"
				></button>
				<span
					class="flex-1 text-sm"
					class:line-through={todo.completed}
					class:text-gray-400={todo.completed}
				>
					{todo.text}
				</span>
				<button
					onclick={() => deleteTodo(todo.id)}
					class="text-xs text-gray-400 hover:text-red-500"
					aria-label="Delete"
				>
					✕
				</button>
			</li>
		{/each}
		{#if todos.length === 0}
			<li class="py-6 text-center text-sm text-gray-400">No todos yet.</li>
		{/if}
	</ul>
</div>
