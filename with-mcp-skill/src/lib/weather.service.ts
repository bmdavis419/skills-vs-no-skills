import { Result, TaggedError } from 'better-result';

interface City {
	id: number;
	name: string;
	country: string;
	timezone: string;
	latitude: number;
	longitude: number;
}

interface CurrentWeather {
	time: string;
	interval: number;
	temperature_2m: number;
	apparent_temperature: number;
	relative_humidity_2m: number;
	weather_code: number;
	cloud_cover: number;
	precipitation: number;
	rain: number;
	showers: number;
	snowfall: number;
	wind_speed_10m: number;
	wind_direction_10m: number;
	wind_gusts_10m: number;
	pressure_msl: number;
	surface_pressure: number;
	is_day: 0 | 1;
}

export interface CityWeather extends City {
	weather: CurrentWeather;
}

export const WMO_DESCRIPTIONS: Record<number, string> = {
	0: 'Clear sky',
	1: 'Mainly clear',
	2: 'Partly cloudy',
	3: 'Overcast',
	45: 'Fog',
	48: 'Icy fog',
	51: 'Light drizzle',
	53: 'Moderate drizzle',
	55: 'Dense drizzle',
	61: 'Slight rain',
	63: 'Moderate rain',
	65: 'Heavy rain',
	71: 'Slight snow',
	73: 'Moderate snow',
	75: 'Heavy snow',
	77: 'Snow grains',
	80: 'Slight showers',
	81: 'Moderate showers',
	82: 'Violent showers',
	95: 'Thunderstorm',
	96: 'Thunderstorm with hail',
	99: 'Thunderstorm with heavy hail'
};

export namespace WeatherService {
	export class WeatherError extends TaggedError('WeatherError')<{
		message: string;
		cause?: unknown;
	}>() {}

	let cities: City[] = [
		{
			id: 5391959,
			name: 'San Francisco',
			country: 'United States',
			timezone: 'America/Los_Angeles',
			latitude: 37.7749,
			longitude: -122.4194
		},
		{
			id: 5128581,
			name: 'New York City',
			country: 'United States',
			timezone: 'America/New_York',
			latitude: 40.7128,
			longitude: -74.006
		}
	];

	const fetchWeather = async (city: City) => {
		const result = await Result.gen(async function* () {
			const res = yield* Result.await(
				Result.tryPromise(() =>
					fetch(
						`https://api.open-meteo.com/v1/forecast` +
							`?latitude=${city.latitude}` +
							`&longitude=${city.longitude}` +
							`&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,cloud_cover,precipitation,rain,showers,snowfall,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,surface_pressure,is_day` +
							`&temperature_unit=fahrenheit` +
							`&wind_speed_unit=mph` +
							`&precipitation_unit=inch`
					)
				)
			);

			const data = yield* Result.await(
				Result.tryPromise(() => res.json() as Promise<{ current: CurrentWeather }>)
			);

			return Result.ok({ ...city, weather: data.current } satisfies CityWeather);
		});

		return result.mapError(
			(error) => new WeatherError({ message: 'Failed to fetch weather data', cause: error })
		);
	};

	export const getAllCities = async () => {
		const results = await Promise.all(cities.map(fetchWeather));

		results.filter(Result.isError).forEach((result) => {
			console.error(result.error.message);
			console.error(result.error.cause);
		});

		return results.filter(Result.isOk).map((result) => result.value);
	};

	export const addCity = async (name: string) => {
		const result = await Result.gen(async function* () {
			const res = yield* Result.await(
				Result.tryPromise(() =>
					fetch(
						`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`
					)
				)
			);

			const data = yield* Result.await(Result.tryPromise(() => res.json()));
			const location = data.results?.[0];

			if (!location) return Result.err(new WeatherError({ message: `City not found: ${name}` }));

			const city: City = {
				id: location.id,
				name: location.name,
				country: location.country,
				timezone: location.timezone,
				latitude: location.latitude,
				longitude: location.longitude
			};

			cities = [...cities, city];
			return fetchWeather(city);
		});

		return result.mapError((error) =>
			error instanceof WeatherError
				? error
				: new WeatherError({ message: 'Failed to add city', cause: error })
		);
	};

	export const deleteCity = (id: number) => {
		const exists = cities.some((c) => c.id === id);
		if (!exists) return Result.err(new WeatherError({ message: `City not found: ${id}` }));
		cities = cities.filter((c) => c.id !== id);
		return Result.ok(undefined);
	};
}
