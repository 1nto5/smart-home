<script lang="ts">
  import type { Lamp } from '$lib/types';
  import { controlLamp, discoverLampIp } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import { translateDeviceName } from '$lib/translations';
  import { debounce } from '$lib/debounce';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Power, Sun, Moon, Sparkles, Search } from 'lucide-svelte';
  import DeviceSlider from './DeviceSlider.svelte';
  import StatusRow from './StatusRow.svelte';
  import DialogPowerButton from './DialogPowerButton.svelte';
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

  // IP discovery state
  let isDiscovering = $state(false);

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
      // WS broadcast will update lamp status
    } catch (e) {
      console.error(e);
      optimisticPower = null;
    }
    isPowerPending = false;
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
      // WS broadcast will update lamp status
    } catch (e) {
      console.error(e);
      notify.error(`${preset.label} failed`);
    }
    activePreset = null;
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

  async function discoverIp() {
    isDiscovering = true;
    try {
      const result = await discoverLampIp(lamp.id);
      if (result.updates.length > 0) {
        const update = result.updates[0];
        notify.success(`IP updated: ${update.new_ip}`);
        // Reload lamps to get new IP
        store.fetchLamps();
      } else if (result.discovered > 0) {
        notify.info('Device found, IP unchanged');
      } else {
        notify.warning('Device not found on network');
      }
    } catch (e) {
      console.error(e);
      notify.error('Discovery failed');
    }
    isDiscovering = false;
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
    <StatusRow label="Status">
      <span class="{displayPower ? (status?.moonlight_mode ? 'text-device-audio-text neon-text-subtle' : 'text-device-lights-text neon-text-subtle') : 'text-content-tertiary'}">
        {#if !isOnline}Offline{:else if displayPower}{status?.moonlight_mode ? 'Moonlight' : 'Active'}{:else}Standby{/if}
      </span>
    </StatusRow>

    {#if !isOnline}
      <!-- Offline: show discover button prominently -->
      <button
        onclick={discoverIp}
        disabled={isDiscovering}
        class="w-full py-4 rounded-xl font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2
               bg-surface-recessed border border-stroke-default text-content-secondary hover:border-accent hover:text-accent disabled:opacity-50"
      >
        <Search class="w-4 h-4 {isDiscovering ? 'animate-spin' : ''}" />
        <span>{isDiscovering ? 'Scanning...' : 'Discover IP'}</span>
      </button>
      <p class="text-xs text-content-tertiary text-center">
        Make sure the lamp is powered on, then scan the network to find its new IP address.
      </p>
    {/if}

    {#if isOnline && status}
      <!-- Large Power Button -->
      <DialogPowerButton
        isOn={displayPower}
        isPending={isPowerPending}
        onclick={togglePower}
        glowClass={status?.moonlight_mode ? 'glow-audio' : 'glow-lights'}
      />

      {#if displayPower}
        <!-- Presets -->
        <div>
          <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Quick Presets</p>
          <div class="grid grid-cols-3 gap-2">
            {#each presets as preset}
              {@const active = isPresetActive(preset) || activePreset === preset.id}
              {@const PresetIcon = preset.icon}
              <button
                onclick={() => applyPreset(preset)}
                disabled={activePreset !== null}
                class="py-3 px-2 rounded-lg transition-all flex flex-col items-center gap-1.5 relative disabled:opacity-50
                       {active
                         ? (preset.moonlight ? 'glow-audio power-btn-on' : 'glow-lights power-btn-on')
                         : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
              >
                <PresetIcon class="w-4 h-4 {activePreset === preset.id ? 'animate-spin' : ''}" />
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
            <DeviceSlider
              value={displayBrightness}
              min={1}
              max={100}
              step={10}
              color="--color-lights"
              ariaLabel="Brightness"
              ariaValueText="{displayBrightness}%"
              oninput={handleBrightnessInput}
            />
          </div>

          <!-- Color Temperature -->
          <div>
            <div class="flex justify-between items-center mb-3">
              <span class="text-xs text-content-tertiary uppercase tracking-wider">Temperature</span>
              <span class="font-display text-lg text-device-lights-text neon-text-subtle">{displayColorTemp}K</span>
            </div>
            <DeviceSlider
              value={displayColorTemp}
              min={1700}
              max={6500}
              step={500}
              inputStep={100}
              color="--color-lights"
              gradient="linear-gradient(to right, #f97316, #fbbf24, #fef3c7, #e0f2fe, #7dd3fc)"
              ariaLabel="Color temperature"
              ariaValueText="{displayColorTemp} Kelvin"
              oninput={handleColorTempInput}
              minBtnClass="bg-surface-recessed border border-stroke-default text-orange-400 hover:border-orange-400/50"
              maxBtnClass="bg-surface-recessed border border-stroke-default text-sky-400 hover:border-sky-400/50"
            />
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
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs text-accent px-2 py-1 rounded bg-accent/10">{lamp.ip}</span>
            <button
              onclick={discoverIp}
              disabled={isDiscovering}
              title="Scan network for new IP"
              class="p-1.5 rounded-lg bg-surface-recessed border border-stroke-default text-content-tertiary hover:text-accent hover:border-accent transition-all disabled:opacity-50"
            >
              <Search class="w-3.5 h-3.5 {isDiscovering ? 'animate-spin' : ''}" />
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</DeviceDialog>
