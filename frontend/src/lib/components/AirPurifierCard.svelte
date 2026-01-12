<script lang="ts">
  import { controlAirPurifier } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Wind, Power, Moon, Gauge, Zap, Thermometer, Droplets, Filter } from 'lucide-svelte';

  let { compact = false }: { compact?: boolean } = $props();
  let status = $derived(store.airPurifier);
  let dialogOpen = $state(false);

  // Optimistic states
  let optimisticPower = $state<boolean | null>(null);
  let optimisticMode = $state<string | null>(null);
  let optimisticFanSpeed = $state<number | null>(null);
  let isPowerPending = $state(false);

  // Display values
  let displayPower = $derived(optimisticPower ?? status?.power ?? false);
  let displayMode = $derived(optimisticMode ?? status?.mode ?? 'auto');
  let displayFanSpeed = $derived(optimisticFanSpeed ?? status?.fan_speed ?? 1);

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

  async function setFanSpeed(level: number) {
    const oldLevel = displayFanSpeed;
    optimisticFanSpeed = level;
    try {
      await controlAirPurifier({ fan_speed: level });
      store.refreshAirPurifier();
    } catch (e) {
      console.error(e);
      optimisticFanSpeed = oldLevel;
    }
    optimisticFanSpeed = null;
  }

  const fanSpeedLabels: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' };

  function aqiColor(aqi: number): string {
    if (aqi <= 50) return 'text-success';
    if (aqi <= 100) return 'text-warning';
    if (aqi <= 150) return 'text-device-climate-heat-text';
    return 'text-error';
  }

  function aqiBg(aqi: number): string {
    if (aqi <= 50) return 'bg-success/10 border-success/30';
    if (aqi <= 100) return 'bg-warning/10 border-warning/30';
    if (aqi <= 150) return 'bg-device-climate-heat-bg border-device-climate-heat-text/30';
    return 'bg-error/10 border-error/30';
  }

  function aqiLabel(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy';
    return 'Very Unhealthy';
  }

  const modes = [
    { value: 'auto', label: 'Auto', icon: Gauge },
    { value: 'silent', label: 'Night', icon: Moon },
    { value: 'favorite', label: 'Manual', icon: Zap },
  ];

  const modeLabels: Record<string, string> = { auto: 'Auto', silent: 'Night', favorite: 'Manual' };
</script>

<!-- Card -->
<div
  onclick={() => (dialogOpen = true)}
  onkeydown={(e) => e.key === 'Enter' && (dialogOpen = true)}
  role="button"
  tabindex="0"
  class="card {compact ? 'p-3' : 'p-4'} w-full text-left cursor-pointer
         {displayPower ? 'card-active glow-air' : ''}"
>
  <div class="flex items-center gap-3">
    <!-- Power toggle -->
    <button
      onclick={(e) => { e.stopPropagation(); togglePower(); }}
      disabled={!status}
      class="power-btn glow-air {displayPower ? 'power-btn-on' : ''}
             disabled:opacity-40 disabled:cursor-not-allowed"
      class:pulse-ring={isPowerPending}
    >
      <Wind class="w-4 h-4" />
    </button>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">Air Purifier</h4>
      {#if displayPower}
        <p class="text-xs text-content-secondary">
          <span class="text-device-air-text">{modeLabels[displayMode] || displayMode}</span>
          <span class="mx-1 text-content-tertiary">/</span>
          <span class="{aqiColor(status?.aqi ?? 0)}">{status?.aqi ?? 0} AQI</span>
        </p>
      {:else}
        <p class="text-xs text-content-tertiary">{status ? 'Standby' : 'Offline'}</p>
      {/if}
    </div>

    <!-- AQI badge -->
    {#if compact && status?.power}
      <div class="px-2 py-1 rounded-md text-xs font-medium shrink-0 border {aqiBg(status.aqi)} {aqiColor(status.aqi)}">
        {status.aqi}
      </div>
    {/if}
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title="Air Purifier">
  <div class="space-y-5">
    <!-- Status -->
    <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
      <span class="text-sm text-content-secondary uppercase tracking-wider">Status</span>
      <span class="font-medium text-sm {displayPower ? 'text-device-air-text neon-text-subtle' : 'text-content-tertiary'}">
        {displayPower ? 'Active' : status ? 'Standby' : 'Offline'}
      </span>
    </div>

    {#if status}
      <!-- Power Button -->
      <button
        onclick={togglePower}
        class="w-full py-4 rounded-xl font-semibold uppercase tracking-wider transition-all relative overflow-hidden
               {displayPower ? 'glow-air power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
      >
        <span class="relative z-10 flex items-center justify-center gap-2">
          <Power class="w-5 h-5" />
          {displayPower ? 'Power Off' : 'Power On'}
        </span>
        {#if isPowerPending}
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        {/if}
      </button>

      {#if displayPower}
        <!-- AQI Display -->
        <div class="rounded-xl p-5 text-center border {aqiBg(status.aqi)}">
          <span class="text-xs uppercase tracking-wider text-content-tertiary">Air Quality Index</span>
          <p class="font-display text-5xl mt-2 {aqiColor(status.aqi)} neon-text">{status.aqi}</p>
          <p class="text-sm mt-2 {aqiColor(status.aqi)}">{aqiLabel(status.aqi)}</p>
        </div>

        <!-- Mode selector -->
        <div>
          <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Operating Mode</p>
          <div class="grid grid-cols-3 gap-2">
            {#each modes as mode}
              <button
                onclick={() => setMode(mode.value)}
                class="py-3 rounded-lg transition-all flex flex-col items-center gap-1.5 font-medium
                       {displayMode === mode.value ? 'glow-air power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
              >
                <svelte:component this={mode.icon} class="w-5 h-5" />
                {mode.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Fan Speed (Manual mode only) -->
        {#if displayMode === 'favorite'}
          <div>
            <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Fan Speed</p>
            <div class="grid grid-cols-3 gap-2">
              {#each [1, 2, 3] as level}
                <button
                  onclick={() => setFanSpeed(level)}
                  class="py-3 rounded-lg transition-all font-medium
                         {displayFanSpeed === level ? 'glow-air power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
                >
                  {fanSpeedLabels[level]}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3">
          {#if status.humidity !== undefined}
            <div class="rounded-xl p-3 text-center bg-surface-recessed border border-stroke-subtle">
              <Droplets class="w-4 h-4 mx-auto text-accent" />
              <p class="font-display text-lg mt-1 text-content-primary">{status.humidity}%</p>
              <span class="text-[10px] text-content-tertiary uppercase">Humidity</span>
            </div>
          {/if}
          {#if status.temperature !== undefined}
            <div class="rounded-xl p-3 text-center bg-surface-recessed border border-stroke-subtle">
              <Thermometer class="w-4 h-4 mx-auto text-device-climate-heat-text" />
              <p class="font-display text-lg mt-1 text-content-primary">{status.temperature}°</p>
              <span class="text-[10px] text-content-tertiary uppercase">Temp</span>
            </div>
          {/if}
          {#if status.filter_life !== undefined}
            <div class="rounded-xl p-3 text-center bg-surface-recessed border border-stroke-subtle {status.filter_life < 20 ? 'border-error/50' : ''}">
              <Filter class="w-4 h-4 mx-auto {status.filter_life < 20 ? 'text-error' : 'text-device-sensors-text'}" />
              <p class="font-display text-lg mt-1 {status.filter_life < 20 ? 'text-error' : 'text-content-primary'}">{status.filter_life}%</p>
              <span class="text-[10px] text-content-tertiary uppercase">Filter</span>
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</DeviceDialog>
