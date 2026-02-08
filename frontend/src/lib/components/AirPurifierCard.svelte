<script lang="ts">
  import { controlAirPurifier } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Wind, Moon, Gauge, Zap, Thermometer, Droplets, Filter, Sun } from 'lucide-svelte';
  import DeviceSlider from './DeviceSlider.svelte';
  import StatusRow from './StatusRow.svelte';
  import DialogPowerButton from './DialogPowerButton.svelte';
  import { debounce } from '$lib/debounce';

  let { compact = false }: { compact?: boolean } = $props();
  let status = $derived(store.airPurifier);
  let dialogOpen = $state(false);

  // Optimistic states
  let optimisticPower = $state<boolean | null>(null);
  let optimisticMode = $state<string | null>(null);
  let optimisticFanSpeed = $state<number | null>(null);
  let optimisticLedBrightness = $state<number | null>(null);
  let isPowerPending = $state(false);
  let pendingMode = $state<string | null>(null);

  // Display values
  let displayPower = $derived(optimisticPower ?? status?.power ?? false);
  let displayMode = $derived(optimisticMode ?? status?.mode ?? 'auto');
  let displayFanSpeed = $derived(optimisticFanSpeed ?? status?.fan_speed ?? 300);
  let displayLedBrightness = $derived(optimisticLedBrightness ?? status?.led_brightness ?? 8);

  async function togglePower() {
    const newPower = !displayPower;
    optimisticPower = newPower;
    isPowerPending = true;
    try {
      await controlAirPurifier({ power: newPower });
      // WS broadcast will update purifier status
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
    pendingMode = mode;
    try {
      await controlAirPurifier({ mode });
      // WS broadcast will update purifier status
    } catch (e) {
      console.error(e);
      optimisticMode = oldMode;
    }
    pendingMode = null;
  }

  // Debounced LED brightness control
  const [sendLedBrightnessDebounced] = debounce(async (level: number) => {
    try {
      await controlAirPurifier({ led_brightness: level });
      // WS broadcast will update purifier status
    } catch (e) {
      console.error(e);
    }
    optimisticLedBrightness = null;
  }, 300);

  function handleLedBrightnessInput(level: number) {
    const clamped = Math.max(0, Math.min(8, Math.round(level)));
    optimisticLedBrightness = clamped;
    sendLedBrightnessDebounced(clamped);
  }

  // Debounced fan speed control
  const [sendFanSpeedDebounced] = debounce(async (rpm: number) => {
    try {
      await controlAirPurifier({ fan_speed: rpm });
      // WS broadcast will update purifier status
    } catch (e) {
      console.error(e);
    }
    optimisticFanSpeed = null;
  }, 300);

  function handleFanSpeedInput(rpm: number) {
    const clamped = Math.max(300, Math.min(2200, Math.round(rpm)));
    optimisticFanSpeed = clamped;
    sendFanSpeedDebounced(clamped);
  }

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
      disabled={!status || isPowerPending}
      class="power-btn glow-air relative {displayPower ? 'power-btn-on' : ''}
             disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Wind class="w-4 h-4 {isPowerPending ? 'animate-spin' : ''}" />
      {#if isPowerPending}
        <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
      {/if}
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
    <StatusRow label="Status">
      <span class="{displayPower ? 'text-device-air-text neon-text-subtle' : 'text-content-tertiary'}">
        {displayPower ? 'Active' : status ? 'Standby' : 'Offline'}
      </span>
    </StatusRow>

    {#if status}
      <!-- Power Button -->
      <DialogPowerButton
        isOn={displayPower}
        isPending={isPowerPending}
        onclick={togglePower}
        glowClass="glow-air"
      />

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
              {@const ModeIcon = mode.icon}
              <button
                onclick={() => setMode(mode.value)}
                disabled={pendingMode !== null}
                class="py-3 rounded-lg transition-all flex flex-col items-center gap-1.5 font-medium relative disabled:opacity-50
                       {displayMode === mode.value ? 'glow-air power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
              >
                <ModeIcon class="w-5 h-5 {pendingMode === mode.value ? 'animate-spin' : ''}" />
                {mode.label}
                {#if pendingMode === mode.value}
                  <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
                {/if}
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
            <DeviceSlider
              value={displayFanSpeed}
              min={300}
              max={2200}
              step={100}
              inputStep={50}
              color="--color-air"
              oninput={handleFanSpeedInput}
            />
          </div>
        {/if}

        <!-- LED Brightness -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs text-content-tertiary uppercase tracking-wider">LED Brightness</span>
            <span class="font-display text-lg text-device-air-text neon-text-subtle flex items-center gap-1.5">
              <Sun class="w-4 h-4" />
              {displayLedBrightness === 0 ? 'Off' : displayLedBrightness}
            </span>
          </div>
          <DeviceSlider
            value={displayLedBrightness}
            min={0}
            max={8}
            color="--color-air"
            oninput={handleLedBrightnessInput}
          />
        </div>

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
