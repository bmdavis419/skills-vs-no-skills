<script lang="ts">
	import { addCity, deleteCity, getCities } from '$lib/remote/weather.remote';
	import { WMO_DESCRIPTIONS } from '$lib/weather.service';

	const cities = $derived(await getCities());

	const weatherEmoji = (code: number, isDay: 0 | 1) => {
		if (code === 0) return isDay ? '☀️' : '🌙';
		if (code <= 2) return isDay ? '🌤️' : '🌙';
		if (code === 3) return '☁️';
		if (code <= 48) return '🌫️';
		if (code <= 55) return '🌦️';
		if (code <= 65) return '🌧️';
		if (code <= 77) return '❄️';
		if (code <= 82) return '🌦️';
		return '⛈️';
	};
</script>

<div class="mx-auto max-w-4xl px-4 py-10">
	<h1 class="mb-2 text-3xl font-bold">Weather</h1>
	<p class="mb-8 text-sm text-gray-500">Current conditions for tracked cities</p>

	<form
		{...addCity.enhance(async ({ submit, form }) => {
			await submit();
			form.reset();
		})}
		class="mb-10 flex gap-2"
	>
		<input
			{...addCity.fields.name.as('text')}
			placeholder="Add a city..."
			class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
		/>
		{#each addCity.fields.name.issues() as issue (issue.message)}
			<p class="mt-1 text-xs text-red-500">{issue.message}</p>
		{/each}
		<button
			type="submit"
			class="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
		>
			Add
		</button>
	</form>

	{#if cities.length === 0}
		<p class="py-16 text-center text-sm text-gray-400">No cities tracked yet. Add one above.</p>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each cities as city (city.id)}
				<div class="relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
					<button
						onclick={() => deleteCity(city.id)}
						class="absolute top-3 right-3 text-xs text-gray-300 hover:text-red-400"
						aria-label="Remove {city.name}"
					>
						✕
					</button>

					<div class="mb-3 flex items-start gap-3">
						<span class="text-4xl leading-none">
							{weatherEmoji(city.weather.weather_code, city.weather.is_day)}
						</span>
						<div>
							<h2 class="leading-tight font-semibold">{city.name}</h2>
							<p class="text-xs text-gray-400">{city.country}</p>
						</div>
					</div>

					<div class="mb-1 flex items-end gap-2">
						<span class="text-4xl font-bold text-amber-600">
							{Math.round(city.weather.temperature_2m)}°F
						</span>
						<span class="mb-1 text-sm text-gray-500">
							Feels {Math.round(city.weather.apparent_temperature)}°
						</span>
					</div>

					<p class="mb-4 text-sm text-gray-600">
						{WMO_DESCRIPTIONS[city.weather.weather_code] ?? 'Unknown'}
					</p>

					<div class="grid grid-cols-2 gap-y-1 text-xs text-gray-500">
						<span>Humidity</span>
						<span class="text-right font-medium text-gray-700">
							{city.weather.relative_humidity_2m}%
						</span>
						<span>Wind</span>
						<span class="text-right font-medium text-gray-700">
							{Math.round(city.weather.wind_speed_10m)} mph
						</span>
						<span>Precipitation</span>
						<span class="text-right font-medium text-gray-700">
							{city.weather.precipitation} in
						</span>
						<span>Cloud cover</span>
						<span class="text-right font-medium text-gray-700">{city.weather.cloud_cover}%</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
