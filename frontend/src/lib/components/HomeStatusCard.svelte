<script lang="ts">
  import { store } from '$lib/stores.svelte';
  import { Thermometer, Flame, Home, Wind } from 'lucide-svelte';

  let status = $derived(store.homeStatus);
  let purifier = $derived(store.airPurifier);

  function aqiColor(aqi: number): string {
    if (aqi <= 50) return 'text-success';
    if (aqi <= 100) return 'text-warning';
    return 'text-error';
  }

  function aqiLabel(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    return 'Poor';
  }
</script>

<!-- Home Status Card - Shows at top of dashboard -->
<div class="card p-4 mb-6">
  <div class="flex items-center gap-3 mb-4">
    <div class="section-icon glow-accent">
      <Home class="w-4 h-4" />
    </div>
    <h2 class="section-title text-accent">Home Status</h2>
  </div>

  {#if status}
    <div class="grid grid-cols-3 gap-3">
      <!-- Weather Station -->
      <div class="flex flex-col items-center p-4 rounded-lg bg-surface-recessed border border-stroke-subtle">
        <Thermometer class="w-6 h-6 text-device-sensors-text mb-2" />
        <span class="text-xs text-content-tertiary uppercase tracking-wider mb-1">Station</span>
        <span class="font-display text-xl text-content-primary">
          {status.weather?.temperature !== null ? `${status.weather.temperature.toFixed(1)}°C` : 'N/A'}
        </span>
        <span class="text-sm text-accent">
          {status.weather?.humidity !== null ? `${status.weather.humidity.toFixed(0)}%` : ''}
        </span>
      </div>

      <!-- Radiator Average -->
      <div class="flex flex-col items-center p-4 rounded-lg bg-surface-recessed border border-stroke-subtle">
        <Flame class="w-6 h-6 text-device-climate-heat-text mb-2" />
        <span class="text-xs text-content-tertiary uppercase tracking-wider mb-1">Radiators</span>
        <span class="font-display text-xl text-content-primary">
          {status.heater.avg_temp !== null ? `${status.heater.avg_temp.toFixed(1)}°C` : 'N/A'}
        </span>
        <span class="text-sm text-content-tertiary">avg</span>
      </div>

      <!-- Air Quality -->
      <div class="flex flex-col items-center p-4 rounded-lg bg-surface-recessed border border-stroke-subtle">
        <Wind class="w-6 h-6 text-device-air-text mb-2" />
        <span class="text-xs text-content-tertiary uppercase tracking-wider mb-1">Air Quality</span>
        <span class="font-display text-xl {purifier ? aqiColor(purifier.aqi) : 'text-content-primary'}">
          {purifier ? purifier.aqi : 'N/A'}
        </span>
        <span class="text-sm {purifier ? aqiColor(purifier.aqi) : 'text-content-tertiary'}">
          {purifier ? aqiLabel(purifier.aqi) : ''}
        </span>
      </div>
    </div>
  {:else}
    <div class="text-center text-content-tertiary py-4">Loading...</div>
  {/if}
</div>

<style>
  .section-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--color-accent) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
    color: var(--color-accent);
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
</style>
