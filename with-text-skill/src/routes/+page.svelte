<script lang="ts">
	import { getCities, deleteCity, addCity } from './weather.remote';
	import { WMO_DESCRIPTIONS } from '$lib/weather.service';

	function weatherEmoji(code: number, isDay: 0 | 1): string {
		if (code === 0) return isDay ? '☀️' : '🌙';
		if (code <= 2) return '🌤️';
		if (code === 3) return '☁️';
		if (code <= 48) return '🌫️';
		if (code <= 55) return '🌦️';
		if (code <= 65) return '🌧️';
		if (code <= 77) return '❄️';
		if (code <= 82) return '🌦️';
		return '⛈️';
	}
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-6xl">
		<h1 class="mb-8 text-3xl font-bold text-gray-900">Weather Dashboard</h1>

		<div class="mb-8 rounded-xl bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">Add a City</h2>
			<form
				{...addCity.enhance(async ({ form, submit }) => {
					await submit().updates(getCities());
					form.reset();
				})}
				class="flex gap-3"
			>
				<input
					{...addCity.fields.name.as('text')}
					placeholder="Enter city name…"
					class="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#059669] focus:ring-1 focus:ring-[#059669] focus:outline-none"
				/>
				<button
					type="submit"
					disabled={addCity.pending > 0}
					class="rounded-lg bg-[#059669] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
				>
					{addCity.pending > 0 ? 'Adding…' : 'Add City'}
				</button>
			</form>
			{#if addCity.fields?.allIssues()?.length}
				<p class="mt-2 text-sm text-red-600">{addCity.fields?.allIssues()?.[0]?.message}</p>
			{/if}
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each await getCities() as city (city.id)}
				<div class="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
					<div class="mb-4 flex items-start justify-between">
						<div>
							<h2 class="text-lg font-semibold text-gray-900">{city.name}</h2>
							<p class="text-sm text-gray-400">{city.country}</p>
						</div>
						<button
							onclick={async () => {
								await deleteCity(city.id).updates(getCities());
							}}
							class="rounded-full p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
							aria-label="Remove {city.name}"
						>
							✕
						</button>
					</div>

					<div class="mb-4 flex items-center gap-4">
						<span class="text-5xl leading-none"
							>{weatherEmoji(city.weather.weather_code, city.weather.is_day)}</span
						>
						<div>
							<p class="text-4xl font-bold text-gray-900">
								{Math.round(city.weather.temperature_2m)}°F
							</p>
							<p class="text-sm text-gray-400">
								Feels like {Math.round(city.weather.apparent_temperature)}°F
							</p>
						</div>
					</div>

					<p class="mb-4 text-sm font-medium text-[#059669]">
						{WMO_DESCRIPTIONS[city.weather.weather_code] ?? 'Unknown'}
					</p>

					<div class="grid grid-cols-2 gap-y-2 text-xs text-gray-500">
						<span>💧 {city.weather.relative_humidity_2m}% humidity</span>
						<span>💨 {Math.round(city.weather.wind_speed_10m)} mph wind</span>
						<span>☁️ {city.weather.cloud_cover}% cloud cover</span>
						<span>🌧️ {city.weather.precipitation}" precip</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
