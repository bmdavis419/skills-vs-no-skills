<script lang="ts">
	import { getCities, deleteCity, addCity } from './weather.remote';
	import { WMO_DESCRIPTIONS } from '$lib/weather.service';

	function weatherEmoji(code: number) {
		if (code === 0) return '☀️';
		if (code <= 2) return '🌤️';
		if (code === 3) return '☁️';
		if (code <= 48) return '🌫️';
		if (code <= 55) return '🌦️';
		if (code <= 65) return '🌧️';
		if (code <= 77) return '❄️';
		if (code <= 82) return '🌧️';
		return '⛈️';
	}
</script>

<div class="min-h-screen bg-slate-50 px-4 py-10">
	<div class="mx-auto max-w-4xl">
		<header class="mb-8">
			<h1 class="text-3xl font-bold tracking-tight text-slate-900">Weather Dashboard</h1>
			<p class="mt-1 text-sm text-slate-500">Real-time data via Open-Meteo</p>
		</header>

		<section class="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">Add City</h2>
			<form
				{...addCity.enhance(async ({ form, submit }) => {
					await submit();
					form.reset();
				})}
				class="flex gap-3"
			>
				<div class="flex min-w-0 flex-1 flex-col">
					<input
						{...addCity.fields.name.as('text')}
						placeholder="Search for a city…"
						class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
					/>
					{#each addCity.fields.name.issues() as issue (issue.message)}
						<p class="mt-1.5 text-xs text-red-500">{issue.message}</p>
					{/each}
				</div>
				<button
					class="shrink-0 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none"
				>
					Add
				</button>
			</form>
		</section>

		<svelte:boundary>
			{#snippet pending()}
				<div class="flex items-center justify-center py-20">
					<p class="animate-pulse text-slate-400">Loading weather data…</p>
				</div>
			{/snippet}

			{#snippet failed(error, reset)}
				<div class="rounded-2xl border border-red-100 bg-red-50 p-10 text-center">
					<p class="mb-4 text-red-700">
						{error instanceof Error ? error.message : 'Failed to load weather data.'}
					</p>
					<button
						onclick={reset}
						class="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
					>
						Try again
					</button>
				</div>
			{/snippet}

			<div class="grid gap-4 sm:grid-cols-2">
				{#each await getCities() as city (city.id)}
					<article
						class="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
					>
						<button
							onclick={() => deleteCity(city.id)}
							aria-label="Remove {city.name}"
							class="absolute top-4 right-4 rounded-lg px-2 py-1 text-xs text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
						>
							Remove
						</button>

						<div class="flex items-start gap-3">
							<span class="text-3xl leading-none">{weatherEmoji(city.weather.weather_code)}</span>
							<div>
								<h3 class="font-semibold text-slate-900">{city.name}</h3>
								<p class="text-sm text-slate-400">{city.country}</p>
							</div>
						</div>

						<div class="mt-4 flex items-baseline gap-1">
							<span class="text-5xl font-bold tracking-tight text-slate-900">
								{Math.round(city.weather.temperature_2m)}°
							</span>
							<span class="text-lg text-slate-400">F</span>
						</div>

						<p class="mt-1 text-sm text-slate-600">
							{WMO_DESCRIPTIONS[city.weather.weather_code] ?? 'Unknown'}
						</p>
						<p class="text-xs text-slate-400">
							Feels like {Math.round(city.weather.apparent_temperature)}°F
						</p>

						<div class="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
							<div>
								<p class="text-xs text-slate-400">Humidity</p>
								<p class="text-sm font-medium text-slate-700">
									{city.weather.relative_humidity_2m}%
								</p>
							</div>
							<div>
								<p class="text-xs text-slate-400">Wind</p>
								<p class="text-sm font-medium text-slate-700">
									{Math.round(city.weather.wind_speed_10m)} mph
								</p>
							</div>
							<div>
								<p class="text-xs text-slate-400">Cloud Cover</p>
								<p class="text-sm font-medium text-slate-700">{city.weather.cloud_cover}%</p>
							</div>
						</div>
					</article>
				{/each}
			</div>
		</svelte:boundary>
	</div>
</div>
