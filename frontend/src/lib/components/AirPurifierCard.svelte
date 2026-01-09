<script lang="ts">
  import { controlAirPurifier } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import DeviceDialog from './DeviceDialog.svelte';

  let { compact = false }: { compact?: boolean } = $props();
  let status = $derived(store.airPurifier);
  let dialogOpen = $state(false);

  // Optimistic states
  let optimisticPower = $state<boolean | null>(null);
  let optimisticMode = $state<string | null>(null);
  let isPowerPending = $state(false);

  // Display values
  let displayPower = $derived(optimisticPower ?? status?.power ?? false);
  let displayMode = $derived(optimisticMode ?? status?.mode ?? 'auto');

  async function togglePower() {
    const newPower = !displayPower;
    optimisticPower = newPower;
    isPowerPending = true;
    try {
      await controlAirPurifier({ power: newPower });
      store.refreshAirPurifier();
    } catch (e) {
      console.error(e);
      optimisticPower = null;
    }
    isPowerPending = false;
    optimisticPower = null;
  }

  async function setMode(mode: string) {
    const oldMode = displayMode;
    optimisticMode = mode;
    try {
      await controlAirPurifier({ mode });
      store.refreshAirPurifier();
    } catch (e) {
      console.error(e);
      optimisticMode = oldMode;
    }
    optimisticMode = null;
  }

  function aqiColor(aqi: number): string {
    if (aqi <= 50) return 'text-success bg-success/20';
    if (aqi <= 100) return 'text-warning bg-warning/20';
    if (aqi <= 150) return 'text-device-climate-heat-text bg-device-climate-heat-bg';
    return 'text-error bg-error/20';
  }

  function aqiLabel(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy';
    return 'Very Unhealthy';
  }

  const modeLabels: Record<string, string> = { auto: 'Auto', silent: 'Night', favorite: 'Manual' };
</script>

<!-- Card -->
<div
  onclick={() => (dialogOpen = true)}
  onkeydown={(e) => e.key === 'Enter' && (dialogOpen = true)}
  role="button"
  tabindex="0"
  class="card transition-card hover:scale-[1.02] {compact ? 'p-2.5' : 'p-3'} w-full text-left cursor-pointer"
>
  <div class="flex items-center gap-2.5">
    <!-- Power toggle -->
    <button
      onclick={(e) => { e.stopPropagation(); togglePower(); }}
      disabled={!status}
      class="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 relative
             {displayPower ? 'badge-air' : 'bg-surface-recessed text-content-tertiary'}
             hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      class:status-active={displayPower}
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.414 1.415l.708-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clip-rule="evenodd"/>
      </svg>
      {#if isPowerPending}
        <span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-device-air-text rounded-full animate-pulse"></span>
      {/if}
    </button>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">Air Purifier</h4>
      {#if displayPower}
        <p class="text-xs text-content-secondary">{modeLabels[displayMode] || displayMode} · {status?.aqi ?? 0} AQI</p>
      {:else}
        <p class="text-xs text-content-secondary">{status ? 'Off' : 'Offline'}</p>
      {/if}
    </div>

    <!-- AQI badge (compact) -->
    {#if compact && status?.power}
      <div class="px-2 py-1 rounded-md text-xs font-medium shrink-0 {aqiColor(status.aqi)}">
        {status.aqi}
      </div>
    {/if}
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title="Air Purifier">
  <div class="space-y-4">
    <!-- Status -->
    <div class="flex items-center justify-between">
      <span class="text-content-secondary">Status</span>
      <span class="font-medium {displayPower ? 'text-device-air-text' : 'text-content-tertiary'}">
        {displayPower ? 'On' : status ? 'Off' : 'Offline'}
      </span>
    </div>

    {#if status}
      <!-- Power Button -->
      <button
        onclick={togglePower}
        class="w-full py-4 rounded-xl text-lg font-medium transition-all relative
               {displayPower ? 'badge-air' : 'bg-surface-recessed text-content-secondary'}
               hover:scale-[1.02]"
      >
        {displayPower ? 'Turn Off' : 'Turn On'}
        {#if isPowerPending}
          <span class="absolute top-2 right-2 w-2 h-2 bg-device-air-text rounded-full animate-pulse"></span>
        {/if}
      </button>

      {#if displayPower}
        <!-- AQI Display -->
        <div class="rounded-xl p-4 text-center {aqiColor(status.aqi)}">
          <span class="text-xs uppercase tracking-wide opacity-80">Air Quality Index</span>
          <p class="text-4xl font-bold mt-1">{status.aqi}</p>
          <p class="text-sm mt-1">{aqiLabel(status.aqi)}</p>
        </div>

        <!-- Mode selector -->
        <div>
          <p class="text-sm text-content-secondary mb-2">Mode</p>
          <div class="grid grid-cols-3 gap-2">
            {#each [{ value: 'auto', label: 'Auto' }, { value: 'silent', label: 'Night' }, { value: 'favorite', label: 'Manual' }] as mode}
              <button
                onclick={() => setMode(mode.value)}
                class="py-3 text-sm rounded-lg transition-colors
                       {displayMode === mode.value ? 'badge-air' : 'bg-surface-recessed text-content-secondary hover:bg-stroke-default'}"
              >
                {mode.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3">
          {#if status.humidity !== undefined}
            <div class="bg-surface-recessed rounded-xl p-3 text-center">
              <span class="text-xs text-content-secondary">Humidity</span>
              <p class="text-lg font-bold mt-1 text-content-primary">{status.humidity}%</p>
            </div>
          {/if}
          {#if status.temperature !== undefined}
            <div class="bg-surface-recessed rounded-xl p-3 text-center">
              <span class="text-xs text-content-secondary">Temp</span>
              <p class="text-lg font-bold mt-1 text-content-primary">{status.temperature}°C</p>
            </div>
          {/if}
          {#if status.filter_life !== undefined}
            <div class="bg-surface-recessed rounded-xl p-3 text-center">
              <span class="text-xs text-content-secondary">Filter</span>
              <p class="text-lg font-bold mt-1 {status.filter_life < 20 ? 'text-error' : 'text-content-primary'}">{status.filter_life}%</p>
            </div>
          {/if}
        </div>
      {/if}

    {/if}
  </div>
</DeviceDialog>
