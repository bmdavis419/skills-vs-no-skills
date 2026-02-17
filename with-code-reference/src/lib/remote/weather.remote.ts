import { command, form, query } from '$app/server';
import * as v from 'valibot';
import { WeatherService } from '$lib/weather.service';

export const getCities = query(async () => WeatherService.getAllCities());

export const addCity = form(
	v.object({ name: v.pipe(v.string(), v.nonEmpty()) }),
	async ({ name }) => {
		await WeatherService.addCity(name);
		await getCities().refresh();
	}
);

export const deleteCity = command(v.number(), async (id) => {
	WeatherService.deleteCity(id);
	await getCities().refresh();
});
