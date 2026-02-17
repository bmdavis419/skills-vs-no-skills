<script lang="ts">
	import { enhance } from '$app/forms';
	import { WMO_DESCRIPTIONS, type CityWeather } from '$lib/weather.service';

	let { data }: { data: { cities: CityWeather[] } } = $props();

	let addCityLoading = $state(false);
	let deletingCityId = $state<number | null>(null);

	function getWeatherIcon(code: number, isDay: 0 | 1): string {
		if (code === 0) return isDay ? '☀️' : '🌙';
		if (code <= 3) return isDay ? '⛅' : '☁️';
		if (code >= 45 && code <= 48) return '🌫️';
		if (code >= 51 && code <= 67) return '🌧️';
		if (code >= 71 && code <= 77) return '❄️';
		if (code >= 80 && code <= 82) return '🌦️';
		if (code >= 95) return '⛈️';
		return '🌡️';
	}

	function formatTime(time: string, timezone: string): string {
		return new Intl.DateTimeFormat('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
			timeZone: timezone
		}).format(new Date(time));
	}
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-8 text-4xl font-bold text-gray-900">Weather Dashboard</h1>

		<form
			method="POST"
			action="?/add"
			class="mb-8 flex gap-4"
			use:enhance={() => {
				addCityLoading = true;
				return async ({ update }) => {
					await update();
					addCityLoading = false;
				};
			}}
		>
			<input
				type="text"
				name="name"
				placeholder="Enter city name..."
				class="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-lg shadow-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
				required
			/>
			<button
				type="submit"
				disabled={addCityLoading}
				class="rounded-lg bg-rose-600 px-6 py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-rose-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
			>
				{addCityLoading ? 'Adding...' : 'Add City'}
			</button>
		</form>

		{#if data.cities.length === 0}
			<div class="rounded-xl bg-white p-12 text-center shadow-sm">
				<p class="text-xl text-gray-500">
					No cities added yet. Add a city above to see weather data.
				</p>
			</div>
		{:else}
			<div class="grid gap-6 sm:grid-cols-2">
				{#each data.cities as city (city.id)}
					<div
						class="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
					>
						<div class="mb-4 flex items-start justify-between">
							<div>
								<h2 class="text-2xl font-bold text-gray-900">{city.name}</h2>
								<p class="text-gray-500">{city.country}</p>
							</div>
							<form
								method="POST"
								action="?/delete"
								use:enhance={() => {
									deletingCityId = city.id;
									return async ({ update }) => {
										await update();
										deletingCityId = null;
									};
								}}
							>
								<input type="hidden" name="id" value={city.id} />
								<button
									type="submit"
									disabled={deletingCityId === city.id}
									class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
									aria-label="Delete city"
								>
									{#if deletingCityId === city.id}
										<svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
									{:else}
										<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
											<path
												fill-rule="evenodd"
												d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
												clip-rule="evenodd"
											/>
										</svg>
									{/if}
								</button>
							</form>
						</div>

						<div class="flex items-center gap-4">
							<span class="text-5xl">
								{getWeatherIcon(city.weather.weather_code, city.weather.is_day)}
							</span>
							<div>
								<p class="text-4xl font-bold text-gray-900">
									{Math.round(city.weather.temperature_2m)}°F
								</p>
								<p class="text-gray-500">
									Feels like {Math.round(city.weather.apparent_temperature)}°F
								</p>
							</div>
						</div>

						<div class="mt-4 border-t border-gray-100 pt-4">
							<p class="text-lg font-medium text-gray-700">
								{WMO_DESCRIPTIONS[city.weather.weather_code] || 'Unknown'}
							</p>
							<p class="text-sm text-gray-500">{formatTime(city.weather.time, city.timezone)}</p>
						</div>

						<div class="mt-4 grid grid-cols-2 gap-3 text-sm">
							<div class="rounded-lg bg-gray-50 p-3">
								<p class="text-gray-500">Humidity</p>
								<p class="font-semibold text-gray-900">{city.weather.relative_humidity_2m}%</p>
							</div>
							<div class="rounded-lg bg-gray-50 p-3">
								<p class="text-gray-500">Wind</p>
								<p class="font-semibold text-gray-900">{city.weather.wind_speed_10m} mph</p>
							</div>
							<div class="rounded-lg bg-gray-50 p-3">
								<p class="text-gray-500">Precipitation</p>
								<p class="font-semibold text-gray-900">{city.weather.precipitation} in</p>
							</div>
							<div class="rounded-lg bg-gray-50 p-3">
								<p class="text-gray-500">Pressure</p>
								<p class="font-semibold text-gray-900">{city.weather.pressure_msl} hPa</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
