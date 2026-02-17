# skills vs no skills

_seeing how well agents can use SvelteKit's new remote functions feature (not in their training data) with different levels of context provided_

https://svelte.dev/docs/kit/remote-functions

- `before-agents` the baseline control project before the agents did anything
- `with-code-reference` no skills or MCPs, just unrelated examples added to the codebase (different features) that illustrate how to do the thing
- `with-mcp-skill` using the svelte teams "svelte skill", that just gives instructions on using the MCP
- `with-test-skill` using a simple skill that just breaks down how to use remote functions
- `without-skill` control group, no skills, mcps, examples, just a prompt.

**THE PROMPT**

```
This project has a weather service already setup and working in it. Your job is to build a UI to display the data from the weather service. Use SvelteKit's remote functions and the new async svelte patterns to fetch the data. Make sure you have the following remote functions: a query for getting all the cities, a command for deleting a city, and a form for adding a city. Make sure you're doing single flight mutations. Use the resources at your disposal to make sure you do this right.
```
