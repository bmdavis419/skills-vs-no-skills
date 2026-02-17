import { WeatherService } from '$lib/weather.service';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const cities = await WeatherService.getAllCities();
	return { cities };
};

export const actions: Actions = {
	add: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');

		if (typeof name !== 'string' || name.length === 0) {
			return fail(400, { name, error: 'City name is required' });
		}

		const result = await WeatherService.addCity(name);

		if (result.isErr()) {
			return fail(400, { name, error: result.error.message });
		}

		return { success: true };
	},
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		if (typeof id !== 'string') {
			return fail(400, { error: 'City ID is required' });
		}

		const cityId = Number.parseInt(id, 10);
		if (Number.isNaN(cityId)) {
			return fail(400, { error: 'Invalid city ID' });
		}

		const result = WeatherService.deleteCity(cityId);

		if (result.isErr()) {
			return fail(400, { error: result.error.message });
		}

		return { success: true };
	}
};
