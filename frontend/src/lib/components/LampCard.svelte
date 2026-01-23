<script lang="ts">
  import type { Lamp } from '$lib/types';
  import { controlLamp, getLampStatus } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import { translateDeviceName } from '$lib/translations';
  import { debounce } from '$lib/debounce';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Power, Sun, Moon, Sparkles, Minus, Plus } from 'lucide-svelte';
  import { notify } from '$lib/toast.svelte';

  let { lamp, compact = false }: { lamp: Lamp; compact?: boolean } = $props();
  let displayName = $derived(translateDeviceName(lamp.name));
  let status = $derived(store.lampStatuses.get(lamp.id));
  let isOnline = $derived(lamp.online === 1);
  let dialogOpen = $state(false);

  // Optimistic states
  let optimisticPower = $state<boolean | null>(null);
  let isPowerPending = $state(false);
  let activePreset = $state<string | null>(null);

  // Local slider state for preview
  let previewBrightness = $state<number | null>(null);
  let previewColorTemp = $state<number | null>(null);

  // Display values (preview or actual) - only show as on if lamp is online
  let displayPower = $derived(isOnline ? (optimisticPower ?? status?.power ?? false) : false);
  let displayBrightness = $derived(previewBrightness ?? status?.brightness ?? 0);
  let displayColorTemp = $derived(previewColorTemp ?? status?.color_temp ?? 0);

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
    { id: 'day', label: 'Day', brightness: 100, colorTemp: 5000, moonlight: false, icon: Sun },
    { id: 'night', label: 'Night', brightness: 30, colorTemp: 2700, moonlight: false, icon: Moon },
    { id: 'moonlight', label: 'Moonlight', brightness: 10, colorTemp: 2700, moonlight: true, icon: Sparkles },
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
      notify.success(`${preset.label} applied`);
      refreshStatus();
    } catch (e) {
      console.error(e);
      notify.error(`${preset.label} failed`);
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
  class="card {compact ? 'p-3' : 'p-4'} w-full text-left cursor-pointer
         {displayPower ? 'card-active glow-lights' : ''}"
>
  <div class="flex items-center gap-3">
    <!-- Power toggle button -->
    <button
      onclick={togglePower}
      disabled={!isOnline || isPowerPending}
      aria-label="{displayPower ? 'Turn off' : 'Turn on'} {displayName}"
      aria-pressed={displayPower}
      class="power-btn glow-lights relative {displayPower ? 'power-btn-on' : ''}
             {status?.moonlight_mode && displayPower ? 'glow-audio' : ''}
             disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Power class="w-4 h-4 {isPowerPending ? 'animate-spin' : ''}" aria-hidden="true" />
      {#if isPowerPending}
        <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
      {/if}
    </button>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">{displayName}</h4>
      {#if !isOnline}
        <p class="text-xs text-content-tertiary">Offline</p>
      {:else if displayPower}
        {#if status?.moonlight_mode}
          <p class="text-xs text-device-audio-text neon-text-subtle">Moonlight</p>
        {:else}
          <p class="text-xs text-content-secondary">
            <span class="text-device-lights-text">{displayBrightness}%</span>
            <span class="mx-1 text-content-tertiary">/</span>
            <span>{displayColorTemp}K</span>
          </p>
        {/if}
      {:else}
        <p class="text-xs text-content-tertiary">Standby</p>
      {/if}
    </div>
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title={displayName}>
  <div class="space-y-5">
    <!-- Status indicator -->
    <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
      <span class="text-sm text-content-secondary uppercase tracking-wider">Status</span>
      <span class="font-medium text-sm {displayPower ? (status?.moonlight_mode ? 'text-device-audio-text neon-text-subtle' : 'text-device-lights-text neon-text-subtle') : 'text-content-tertiary'}">
        {#if !isOnline}
          Offline
        {:else if displayPower}
          {status?.moonlight_mode ? 'Moonlight' : 'Active'}
        {:else}
          Standby
        {/if}
      </span>
    </div>

    {#if isOnline && status}
      <!-- Large Power Button -->
      <button
        onclick={togglePower}
        disabled={isPowerPending}
        class="w-full py-4 rounded-xl font-semibold uppercase tracking-wider transition-all relative overflow-hidden flex items-center justify-center gap-2 disabled:opacity-50
               {displayPower
                 ? (status.moonlight_mode ? 'glow-audio power-btn-on' : 'glow-lights power-btn-on')
                 : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
      >
        <Power class="w-4 h-4 relative z-10 {isPowerPending ? 'animate-spin' : ''}" />
        <span class="relative z-10">{displayPower ? 'Power Off' : 'Power On'}</span>
        {#if isPowerPending}
          <div class="absolute inset-0 rounded-xl border-2 border-current animate-glow"></div>
        {/if}
      </button>

      {#if displayPower}
        <!-- Presets -->
        <div>
          <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Quick Presets</p>
          <div class="grid grid-cols-3 gap-2">
            {#each presets as preset}
              {@const active = isPresetActive(preset) || activePreset === preset.id}
              <button
                onclick={() => applyPreset(preset)}
                disabled={activePreset !== null}
                class="py-3 px-2 rounded-lg transition-all flex flex-col items-center gap-1.5 relative disabled:opacity-50
                       {active
                         ? (preset.moonlight ? 'glow-audio power-btn-on' : 'glow-lights power-btn-on')
                         : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
              >
                <svelte:component this={preset.icon} class="w-4 h-4 {activePreset === preset.id ? 'animate-spin' : ''}" />
                <span class="text-xs font-medium">{preset.label}</span>
                {#if activePreset === preset.id}
                  <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        {#if !status.moonlight_mode}
          <!-- Brightness -->
          <div>
            <div class="flex justify-between items-center mb-3">
              <span class="text-xs text-content-tertiary uppercase tracking-wider">Brightness</span>
              <span class="font-display text-lg text-device-lights-text neon-text-subtle">{displayBrightness}%</span>
            </div>
            <div class="flex gap-2 items-center">
              <button
                onclick={() => handleBrightnessInput(Math.max(1, displayBrightness - 10))}
                class="w-10 h-10 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong hover:text-content-primary transition-all flex items-center justify-center"
              >
                <Minus class="w-5 h-5" />
              </button>
              <div class="flex-1 h-10 rounded-lg bg-surface-recessed border border-stroke-default overflow-hidden relative">
                <div
                  class="absolute inset-y-0 left-0 bg-device-lights-text/30 transition-all duration-150"
                  style="width: {displayBrightness}%"
                ></div>
                <div
                  class="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-device-lights-text shadow-[0_0_10px_var(--color-lights-glow)] transition-all duration-150"
                  style="left: calc({displayBrightness}% - 8px)"
                ></div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={displayBrightness}
                  oninput={(e) => handleBrightnessInput(parseInt(e.currentTarget.value))}
                  aria-label="Brightness"
                  aria-valuemin={1}
                  aria-valuemax={100}
                  aria-valuenow={displayBrightness}
                  aria-valuetext="{displayBrightness}%"
                  class="absolute inset-0 w-full h-full slider-accessible cursor-pointer"
                />
              </div>
              <button
                onclick={() => handleBrightnessInput(Math.min(100, displayBrightness + 10))}
                class="w-10 h-10 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong hover:text-content-primary transition-all flex items-center justify-center"
              >
                <Plus class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Color Temperature -->
          <div>
            <div class="flex justify-between items-center mb-3">
              <span class="text-xs text-content-tertiary uppercase tracking-wider">Temperature</span>
              <span class="font-display text-lg text-device-lights-text neon-text-subtle">{displayColorTemp}K</span>
            </div>
            <div class="flex gap-2 items-center">
              <button
                onclick={() => handleColorTempInput(Math.max(1700, displayColorTemp - 500))}
                class="w-10 h-10 rounded-lg bg-surface-recessed border border-stroke-default text-orange-400 hover:border-orange-400/50 transition-all flex items-center justify-center"
              >
                <Minus class="w-5 h-5" />
              </button>
              <div class="flex-1 h-10 rounded-lg overflow-hidden relative" style="background: linear-gradient(to right, #f97316, #fbbf24, #fef3c7, #e0f2fe, #7dd3fc);">
                <div
                  class="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-content-primary shadow-lg transition-all duration-150"
                  style="left: calc({((displayColorTemp - 1700) / 4800) * 100}% - 8px)"
                ></div>
                <input
                  type="range"
                  min="1700"
                  max="6500"
                  step="100"
                  value={displayColorTemp}
                  oninput={(e) => handleColorTempInput(parseInt(e.currentTarget.value))}
                  aria-label="Color temperature"
                  aria-valuemin={1700}
                  aria-valuemax={6500}
                  aria-valuenow={displayColorTemp}
                  aria-valuetext="{displayColorTemp} Kelvin"
                  class="absolute inset-0 w-full h-full slider-accessible cursor-pointer"
                />
              </div>
              <button
                onclick={() => handleColorTempInput(Math.min(6500, displayColorTemp + 500))}
                class="w-10 h-10 rounded-lg bg-surface-recessed border border-stroke-default text-sky-400 hover:border-sky-400/50 transition-all flex items-center justify-center"
              >
                <Plus class="w-5 h-5" />
              </button>
            </div>
            <div class="flex justify-between text-[10px] text-content-tertiary mt-2 uppercase tracking-wider">
              <span class="text-orange-400">Warm</span>
              <span class="text-sky-400">Cool</span>
            </div>
          </div>
        {:else}
          <!-- Moonlight mode info -->
          <div class="py-6 text-center rounded-lg bg-device-audio-bg/30 border border-device-audio-text/20">
            <Sparkles class="w-6 h-6 mx-auto mb-2 text-device-audio-text" />
            <p class="text-sm text-device-audio-text">Hardware Night Mode</p>
          </div>
        {/if}
      {/if}

      <!-- Device Info -->
      <div class="pt-4 border-t border-stroke-subtle space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-xs text-content-tertiary uppercase tracking-wider">IP Address</span>
          <span class="font-mono text-xs text-accent px-2 py-1 rounded bg-accent/10">{lamp.ip}</span>
        </div>
      </div>
    {/if}
  </div>
</DeviceDialog>
