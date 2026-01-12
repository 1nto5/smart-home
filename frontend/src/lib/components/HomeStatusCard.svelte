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
{#if status}
  <div class="grid grid-cols-3 gap-2 sm:gap-3">
    <!-- Weather Station -->
    <div class="status-tile">
      <Thermometer class="w-5 h-5 sm:w-6 sm:h-6 text-device-sensors-text" />
      <span class="status-label">Station</span>
      <span class="status-value">
        {status.weather?.temperature !== null ? `${status.weather.temperature.toFixed(1)}°C` : 'N/A'}
      </span>
      <span class="status-sub text-accent">
        {status.weather?.humidity !== null ? `${status.weather.humidity.toFixed(0)}%` : ''}
      </span>
    </div>

    <!-- Radiator Average -->
    <div class="status-tile">
      <Flame class="w-5 h-5 sm:w-6 sm:h-6 text-device-climate-heat-text" />
      <span class="status-label">Radiators</span>
      <span class="status-value">
        {status.heater.avg_temp !== null ? `${status.heater.avg_temp.toFixed(1)}°C` : 'N/A'}
      </span>
      <span class="status-sub text-content-tertiary">avg</span>
    </div>

    <!-- Air Quality -->
    <div class="status-tile">
      <Wind class="w-5 h-5 sm:w-6 sm:h-6 text-device-air-text" />
      <span class="status-label">Air<br class="sm:hidden"/> Quality</span>
      <span class="status-value {purifier ? aqiColor(purifier.aqi) : ''}">
        {purifier ? purifier.aqi : 'N/A'}
      </span>
      <span class="status-sub {purifier ? aqiColor(purifier.aqi) : 'text-content-tertiary'}">
        {purifier ? aqiLabel(purifier.aqi) : ''}
      </span>
    </div>
  </div>
{/if}

<style>
  .status-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border-radius: 0.75rem;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-stroke-subtle);
    text-align: center;
  }

  @media (min-width: 640px) {
    .status-tile {
      padding: 1rem;
    }
  }

  .status-label {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-content-tertiary);
    margin-top: 0.25rem;
    line-height: 1.2;
  }

  @media (min-width: 640px) {
    .status-label {
      font-size: 0.75rem;
      letter-spacing: 0.1em;
    }
  }

  .status-value {
    font-family: var(--font-display);
    font-size: 1.125rem;
    color: var(--color-content-primary);
    margin-top: 0.25rem;
  }

  @media (min-width: 640px) {
    .status-value {
      font-size: 1.25rem;
    }
  }

  .status-sub {
    font-size: 0.75rem;
  }

  @media (min-width: 640px) {
    .status-sub {
      font-size: 0.875rem;
    }
  }
</style>
