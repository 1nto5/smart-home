<script lang="ts">
  import { controlAirPurifier } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Wind, Power, Moon, Gauge, Zap, Thermometer, Droplets, Filter, Minus, Plus } from 'lucide-svelte';
  import { debounce } from '$lib/debounce';

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
  let displayFanSpeed = $derived(optimisticFanSpeed ?? status?.fan_speed ?? 300);

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
      await store.refreshAirPurifier();
      // Keep optimisticMode to prevent flicker
    } catch (e) {
      console.error(e);
      optimisticMode = oldMode;
    }
  }

  // Debounced fan speed control
  const [sendFanSpeedDebounced] = debounce(async (rpm: number) => {
    try {
      await controlAirPurifier({ fan_speed: rpm });
      await store.refreshAirPurifier();
      // Clear optimistic state so actual device value is shown
      optimisticFanSpeed = null;
    } catch (e) {
      console.error(e);
      optimisticFanSpeed = null;
    }
  }, 300);

  function handleFanSpeedInput(rpm: number) {
    const clamped = Math.max(300, Math.min(2200, Math.round(rpm)));
    optimisticFanSpeed = clamped;
    sendFanSpeedDebounced(clamped);
  }

  // Calculate slider position (300=0%, 2200=100%)
  let sliderPercent = $derived(((displayFanSpeed - 300) / 1900) * 100);

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
            <div class="flex justify-between items-center mb-3">
              <span class="text-xs text-content-tertiary uppercase tracking-wider">Fan Speed</span>
              <span class="font-display text-lg text-device-air-text neon-text-subtle">{displayFanSpeed} RPM</span>
            </div>
            <div class="flex gap-2 items-center">
              <button
                onclick={() => handleFanSpeedInput(displayFanSpeed - 100)}
                disabled={displayFanSpeed <= 300}
                class="w-10 h-10 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong hover:text-content-primary transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus class="w-5 h-5" />
              </button>
              <div class="flex-1 h-10 rounded-lg bg-surface-recessed border border-stroke-default overflow-hidden relative">
                <div
                  class="absolute inset-y-0 left-0 bg-device-air-text/30 transition-all duration-150"
                  style="width: {sliderPercent}%"
                ></div>
                <div
                  class="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-device-air-text shadow-[0_0_10px_var(--color-air-glow)] transition-all duration-150"
                  style="left: clamp(8px, calc({sliderPercent}% - 8px + 8px), calc(100% - 8px))"
                ></div>
                <input
                  type="range"
                  min="300"
                  max="2200"
                  step="50"
                  value={displayFanSpeed}
                  oninput={(e) => handleFanSpeedInput(parseInt(e.currentTarget.value))}
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <button
                onclick={() => handleFanSpeedInput(displayFanSpeed + 100)}
                disabled={displayFanSpeed >= 2200}
                class="w-10 h-10 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong hover:text-content-primary transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus class="w-5 h-5" />
              </button>
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
