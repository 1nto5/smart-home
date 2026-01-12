<script lang="ts">
  import { store } from '$lib/stores.svelte';
  import { Thermometer, Droplet, Lightbulb, Flame, Home } from 'lucide-svelte';

  let status = $derived(store.homeStatus);
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
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <!-- Weather - Temperature -->
      <div class="flex flex-col items-center p-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
        <Thermometer class="w-5 h-5 text-device-sensors-text mb-1" />
        <span class="text-xs text-content-tertiary uppercase tracking-wider">Temp</span>
        <span class="font-display text-lg text-content-primary">
          {status.weather?.temperature !== null ? `${status.weather.temperature.toFixed(1)}°C` : 'N/A'}
        </span>
      </div>

      <!-- Weather - Humidity -->
      <div class="flex flex-col items-center p-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
        <Droplet class="w-5 h-5 text-accent mb-1" />
        <span class="text-xs text-content-tertiary uppercase tracking-wider">Humidity</span>
        <span class="font-display text-lg text-content-primary">
          {status.weather?.humidity !== null ? `${status.weather.humidity.toFixed(1)}%` : 'N/A'}
        </span>
      </div>

      <!-- Lights Mode -->
      <div class="flex flex-col items-center p-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
        <Lightbulb class="w-5 h-5 text-device-lights-text mb-1" />
        <span class="text-xs text-content-tertiary uppercase tracking-wider">Lights</span>
        <span class="font-display text-lg text-content-primary truncate max-w-full">
          {status.lamp.preset_name ?? 'N/A'}
        </span>
      </div>

      <!-- Heating Mode -->
      <div class="flex flex-col items-center p-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
        <Flame class="w-5 h-5 text-device-climate-heat-text mb-1" />
        <span class="text-xs text-content-tertiary uppercase tracking-wider">Heating</span>
        <span class="font-display text-lg text-content-primary truncate max-w-full">
          {#if status.heater.override}
            {status.heater.override.mode === 'pause' ? 'Paused' : `${status.heater.override.fixed_temp}°C`}
          {:else}
            {status.heater.preset_name ?? 'N/A'}
          {/if}
        </span>
        {#if status.heater.avg_temp !== null}
          <span class="text-xs text-content-tertiary">avg {status.heater.avg_temp}°C</span>
        {/if}
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
