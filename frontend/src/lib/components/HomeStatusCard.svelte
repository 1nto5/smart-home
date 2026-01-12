<script lang="ts">
  import { store } from '$lib/stores.svelte';
  import { Thermometer, Droplet, Flame, Home } from 'lucide-svelte';

  let status = $derived(store.homeStatus);

  // Calculate average indoor temp from weather station + heaters
  let avgIndoorTemp = $derived(() => {
    if (!status) return null;
    const temps: number[] = [];
    if (status.weather?.temperature !== null) temps.push(status.weather.temperature);
    if (status.heater.avg_temp !== null) temps.push(status.heater.avg_temp);
    if (temps.length === 0) return null;
    return (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
  });
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
    <div class="grid grid-cols-2 gap-3">
      <!-- Indoor Temperature (avg of weather station + heaters) -->
      <div class="flex flex-col items-center p-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
        <Thermometer class="w-5 h-5 text-device-sensors-text mb-1" />
        <span class="text-xs text-content-tertiary uppercase tracking-wider">Indoor</span>
        <span class="font-display text-lg text-content-primary">
          {avgIndoorTemp() !== null ? `${avgIndoorTemp()}°C` : 'N/A'}
        </span>
      </div>

      <!-- Humidity -->
      <div class="flex flex-col items-center p-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
        <Droplet class="w-5 h-5 text-accent mb-1" />
        <span class="text-xs text-content-tertiary uppercase tracking-wider">Humidity</span>
        <span class="font-display text-lg text-content-primary">
          {status.weather?.humidity !== null ? `${status.weather.humidity.toFixed(0)}%` : 'N/A'}
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
