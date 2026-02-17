import * as v from 'valibot';
import { query, command, form } from '$app/server';
import { invalid } from '@sveltejs/kit';
import { WeatherService } from '$lib/weather.service';

export const getCities = query(async () => WeatherService.getAllCities());

export const deleteCity = command(v.number(), async (id) => {
	WeatherService.deleteCity(id).match({
		ok: () => {},
		err: (e) => {
			throw new Error(e.message);
		}
	});
	await getCities().refresh();
});

export const addCity = form(
	v.object({ name: v.pipe(v.string(), v.nonEmpty('City name is required')) }),
	async ({ name }, issue) => {
		const result = await WeatherService.addCity(name);
		result.match({
			ok: () => {},
			err: (e) => invalid(issue.name(e.message))
		});
		await getCities().refresh();
	}
);
