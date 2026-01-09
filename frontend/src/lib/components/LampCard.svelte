<script lang="ts">
  import type { Lamp } from '$lib/types';
  import { controlLamp, getLampStatus } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import { translateDeviceName } from '$lib/translations';
  import { debounce } from '$lib/debounce';
  import DeviceDialog from './DeviceDialog.svelte';

  let { lamp, compact = false }: { lamp: Lamp; compact?: boolean } = $props();
  let displayName = $derived(translateDeviceName(lamp.name));
  let status = $derived(store.lampStatuses.get(lamp.id));
  let fetched = $state(false);
  let dialogOpen = $state(false);

  // Optimistic states
  let optimisticPower = $state<boolean | null>(null);
  let isPowerPending = $state(false);
  let activePreset = $state<string | null>(null);

  // Local slider state for preview
  let previewBrightness = $state<number | null>(null);
  let previewColorTemp = $state<number | null>(null);

  // Display values (preview or actual)
  let displayPower = $derived(optimisticPower ?? status?.power ?? false);
  let displayBrightness = $derived(previewBrightness ?? status?.brightness ?? 0);
  let displayColorTemp = $derived(previewColorTemp ?? status?.color_temp ?? 0);

  $effect(() => {
    if (!fetched) {
      fetched = true;
      getLampStatus(lamp.id)
        .then(res => store.updateLampStatus(lamp.id, res.status))
        .catch(() => {});
    }
  });

  async function togglePower(e: MouseEvent) {
    e.stopPropagation();
    const newPower = !displayPower;
    optimisticPower = newPower;
    isPowerPending = true;
    try {
      await controlLamp(lamp.id, { toggle: true });
      refreshStatus();
    } catch (e) {
      console.error(e);
      optimisticPower = null;
      isPowerPending = false;
    }
  }

  async function refreshStatus() {
    try {
      const res = await getLampStatus(lamp.id);
      store.updateLampStatus(lamp.id, res.status);
      optimisticPower = null;
    } catch (e) {
      console.error(e);
    }
    isPowerPending = false;
    activePreset = null;
  }

  // Debounced slider API calls
  const [sendBrightnessDebounced] = debounce(async (value: number) => {
    try {
      await controlLamp(lamp.id, { brightness: value });
      if (status) store.updateLampStatus(lamp.id, { ...status, brightness: value });
    } catch (e) {
      console.error(e);
    }
    previewBrightness = null;
  }, 300);

  const [sendColorTempDebounced] = debounce(async (value: number) => {
    try {
      await controlLamp(lamp.id, { color_temp: value });
      if (status) store.updateLampStatus(lamp.id, { ...status, color_temp: value });
    } catch (e) {
      console.error(e);
    }
    previewColorTemp = null;
  }, 300);

  function handleBrightnessInput(value: number) {
    previewBrightness = value;
    sendBrightnessDebounced(value);
  }

  function handleColorTempInput(value: number) {
    previewColorTemp = value;
    sendColorTempDebounced(value);
  }

  // Preset definitions
  const presets = [
    { id: 'day', label: 'Day', brightness: 100, colorTemp: 5000, moonlight: false },
    { id: 'night', label: 'Night', brightness: 30, colorTemp: 2700, moonlight: false },
    { id: 'moonlight', label: 'Moonlight', brightness: 10, colorTemp: 2700, moonlight: true },
  ] as const;

  async function applyPreset(preset: typeof presets[number]) {
    activePreset = preset.id;
    // Optimistic update
    if (preset.moonlight) {
      if (status) store.updateLampStatus(lamp.id, { ...status, power: true, moonlight_mode: true, brightness: preset.brightness });
    } else {
      if (status) store.updateLampStatus(lamp.id, { ...status, power: true, moonlight_mode: false, brightness: preset.brightness, color_temp: preset.colorTemp });
    }
    try {
      if (preset.moonlight) {
        await controlLamp(lamp.id, { moonlight: true, moonlight_brightness: preset.brightness });
      } else {
        if (status?.moonlight_mode) {
          await controlLamp(lamp.id, { moonlight: false });
        } else if (!status?.power) {
          await controlLamp(lamp.id, { power: true });
        }
        await controlLamp(lamp.id, { brightness: preset.brightness, color_temp: preset.colorTemp });
      }
      refreshStatus();
    } catch (e) {
      console.error(e);
      activePreset = null;
      refreshStatus();
    }
  }

  // Check if preset is currently active
  function isPresetActive(preset: typeof presets[number]): boolean {
    if (!displayPower) return false;
    if (preset.moonlight) return status?.moonlight_mode ?? false;
    if (status?.moonlight_mode) return false;
    const brightMatch = Math.abs((status?.brightness ?? 0) - preset.brightness) <= 5;
    const tempMatch = Math.abs((status?.color_temp ?? 0) - preset.colorTemp) <= 200;
    return brightMatch && tempMatch;
  }
</script>

<!-- Card -->
<div
  onclick={() => dialogOpen = true}
  onkeydown={(e) => e.key === 'Enter' && (dialogOpen = true)}
  role="button"
  tabindex="0"
  class="card transition-card hover:scale-[1.02] {compact ? 'p-2.5' : 'p-3'} w-full text-left cursor-pointer"
>
  <div class="flex items-center gap-2.5">
    <!-- Power toggle button -->
    <button
      onclick={togglePower}
      disabled={!status}
      class="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 relative
             {displayPower ? (status?.moonlight_mode ? 'bg-device-audio-bg text-device-audio-text' : 'badge-lights') : 'bg-surface-recessed text-content-tertiary'}
             hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      class:status-active={displayPower}
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0v-6.5A.75.75 0 0110 2z"/>
        <path d="M5.404 4.343a.75.75 0 10-1.06 1.06 6.5 6.5 0 109.192 0 .75.75 0 00-1.06-1.06 5 5 0 11-7.072 0z"/>
      </svg>
      {#if isPowerPending}
        <span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-device-lights-text rounded-full animate-pulse"></span>
      {/if}
    </button>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">{displayName}</h4>
      {#if displayPower}
        {#if status?.moonlight_mode}
          <p class="text-xs text-device-audio-text">Moonlight</p>
        {:else}
          <p class="text-xs text-content-secondary">{displayBrightness}% &middot; {displayColorTemp}K</p>
        {/if}
      {:else}
        <p class="text-xs text-content-secondary">{status ? 'Off' : 'Offline'}</p>
      {/if}
    </div>
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title={displayName}>
  <div class="space-y-4">
    <!-- Status -->
    <div class="flex items-center justify-between">
      <span class="text-content-secondary">Status</span>
      <span class="font-medium {displayPower ? (status?.moonlight_mode ? 'text-device-audio-text' : 'text-device-lights-text') : 'text-content-tertiary'}">
        {#if displayPower}
          {status?.moonlight_mode ? 'Moonlight' : 'On'}
        {:else}
          {status ? 'Off' : 'Offline'}
        {/if}
      </span>
    </div>

    {#if status}
      <!-- Large Power Button -->
      <button
        onclick={togglePower}
        class="w-full py-4 rounded-xl text-lg font-medium transition-all relative
               {displayPower ? (status.moonlight_mode ? 'bg-device-audio-bg text-device-audio-text' : 'badge-lights') : 'bg-surface-recessed text-content-secondary'}
               hover:scale-[1.02]"
      >
        {displayPower ? 'Turn Off' : 'Turn On'}
        {#if isPowerPending}
          <span class="absolute top-2 right-2 w-2 h-2 bg-device-lights-text rounded-full animate-pulse"></span>
        {/if}
      </button>

      {#if displayPower}
        <!-- Presets -->
        <div>
          <p class="text-sm text-content-secondary mb-2">Presets</p>
          <div class="grid grid-cols-3 gap-2">
            {#each presets as preset}
              <button
                onclick={() => applyPreset(preset)}
                class="py-2.5 text-sm rounded-lg transition-all relative
                       {isPresetActive(preset) || activePreset === preset.id
                         ? (preset.moonlight ? 'bg-device-audio-bg text-device-audio-text' : 'badge-lights')
                         : 'bg-surface-recessed text-content-secondary hover:bg-stroke-default'}"
              >
                {preset.label}
                {#if activePreset === preset.id}
                  <span class="absolute top-1 right-1 w-1.5 h-1.5 bg-device-lights-text rounded-full animate-pulse"></span>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        {#if !status.moonlight_mode}
          <!-- Brightness -->
          <div>
            <div class="flex justify-between text-sm text-content-secondary mb-2">
              <span>Brightness</span>
              <span class="font-medium text-content-primary">{displayBrightness}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={displayBrightness}
              oninput={(e) => handleBrightnessInput(parseInt(e.currentTarget.value))}
              class="w-full"
            />
          </div>

          <!-- Color Temperature -->
          <div>
            <div class="flex justify-between text-sm text-content-secondary mb-2">
              <span>Color Temperature</span>
              <span class="font-medium text-content-primary">{displayColorTemp}K</span>
            </div>
            <input
              type="range"
              min="1700"
              max="6500"
              step="100"
              value={displayColorTemp}
              oninput={(e) => handleColorTempInput(parseInt(e.currentTarget.value))}
              class="w-full"
            />
            <div class="flex justify-between text-xs text-content-tertiary mt-1">
              <span>Warm</span>
              <span>Cool</span>
            </div>
          </div>
        {:else}
          <!-- Moonlight mode info -->
          <div class="py-4 text-center text-sm text-device-audio-text/80">
            Hardware night light mode active
          </div>
        {/if}
      {/if}

      <!-- Device Info -->
      <div class="pt-4 border-t border-stroke-default space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-content-secondary">IP Address</span>
          <span class="font-mono text-xs text-content-tertiary">{lamp.ip}</span>
        </div>
      </div>
    {/if}
  </div>
</DeviceDialog>
