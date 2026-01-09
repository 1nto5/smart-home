<script lang="ts">
  import type { Lamp } from '$lib/types';
  import { controlLamp, getLampStatus } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import { translateDeviceName } from '$lib/translations';
  import DeviceDialog from './DeviceDialog.svelte';

  let { lamp, compact = false }: { lamp: Lamp; compact?: boolean } = $props();
  let displayName = $derived(translateDeviceName(lamp.name));
  let status = $derived(store.lampStatuses.get(lamp.id));
  let loading = $state(false);
  let fetched = $state(false);
  let dialogOpen = $state(false);

  // Local slider state for preview
  let previewBrightness = $state<number | null>(null);
  let previewColorTemp = $state<number | null>(null);

  // Display values (preview or actual)
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
    loading = true;
    try {
      await controlLamp(lamp.id, { toggle: true });
      const res = await getLampStatus(lamp.id);
      store.updateLampStatus(lamp.id, res.status);
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function setBrightness(value: number) {
    previewBrightness = null;
    try {
      await controlLamp(lamp.id, { brightness: value });
      if (status) store.updateLampStatus(lamp.id, { ...status, brightness: value });
    } catch (e) {
      console.error(e);
    }
  }

  async function setColorTemp(value: number) {
    previewColorTemp = null;
    try {
      await controlLamp(lamp.id, { color_temp: value });
      if (status) store.updateLampStatus(lamp.id, { ...status, color_temp: value });
    } catch (e) {
      console.error(e);
    }
  }

  // Preset definitions
  const presets = [
    { id: 'day', label: 'Day', brightness: 100, colorTemp: 5000, moonlight: false },
    { id: 'night', label: 'Night', brightness: 30, colorTemp: 2700, moonlight: false },
    { id: 'moonlight', label: 'Moonlight', brightness: 10, colorTemp: 2700, moonlight: true },
  ] as const;

  async function applyPreset(preset: typeof presets[number]) {
    loading = true;
    try {
      if (preset.moonlight) {
        await controlLamp(lamp.id, { moonlight: true, moonlight_brightness: preset.brightness });
      } else {
        // Exit moonlight mode if needed, then set values
        if (status?.moonlight_mode) {
          await controlLamp(lamp.id, { moonlight: false });
        } else if (!status?.power) {
          await controlLamp(lamp.id, { power: true });
        }
        await controlLamp(lamp.id, { brightness: preset.brightness, color_temp: preset.colorTemp });
      }
      const res = await getLampStatus(lamp.id);
      store.updateLampStatus(lamp.id, res.status);
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  // Check if preset is currently active
  function isPresetActive(preset: typeof presets[number]): boolean {
    if (!status?.power) return false;
    if (preset.moonlight) return status?.moonlight_mode ?? false;
    if (status?.moonlight_mode) return false;
    // Allow some tolerance for brightness/temp matching
    const brightMatch = Math.abs(status.brightness - preset.brightness) <= 5;
    const tempMatch = Math.abs(status.color_temp - preset.colorTemp) <= 200;
    return brightMatch && tempMatch;
  }
</script>

<!-- Card -->
<div
  onclick={() => dialogOpen = true}
  onkeydown={(e) => e.key === 'Enter' && (dialogOpen = true)}
  role="button"
  tabindex="0"
  class="glass-card rounded-xl transition-card hover:scale-[1.02] {compact ? 'p-2.5' : 'p-3'} w-full text-left cursor-pointer"
>
  <div class="flex items-center gap-2.5">
    <!-- Power toggle button -->
    <button
      onclick={togglePower}
      disabled={loading || !status}
      class="w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0
             {status?.power ? (status?.moonlight_mode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400') : 'bg-zinc-800/60 text-zinc-500'}
             hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      class:status-active={status?.power}
    >
      {#if loading}
        <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      {:else}
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0v-6.5A.75.75 0 0110 2z"/>
          <path d="M5.404 4.343a.75.75 0 10-1.06 1.06 6.5 6.5 0 109.192 0 .75.75 0 00-1.06-1.06 5 5 0 11-7.072 0z"/>
        </svg>
      {/if}
    </button>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm truncate">{displayName}</h4>
      {#if status?.power}
        {#if status.moonlight_mode}
          <p class="text-xs text-indigo-400">Moonlight</p>
        {:else}
          <p class="text-xs text-[var(--muted)]">{status.brightness}% &middot; {status.color_temp}K</p>
        {/if}
      {:else}
        <p class="text-xs text-[var(--muted)]">{status ? 'Off' : 'Offline'}</p>
      {/if}
    </div>
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title={displayName}>
  <div class="space-y-4">
    <!-- Status -->
    <div class="flex items-center justify-between">
      <span class="text-[var(--muted)]">Status</span>
      <span class="font-medium {status?.power ? (status?.moonlight_mode ? 'text-indigo-400' : 'text-amber-400') : 'text-zinc-500'}">
        {#if status?.power}
          {status.moonlight_mode ? 'Moonlight' : 'On'}
        {:else}
          {status ? 'Off' : 'Offline'}
        {/if}
      </span>
    </div>

    {#if status}
      <!-- Large Power Button -->
      <button
        onclick={togglePower}
        disabled={loading}
        class="w-full py-4 rounded-xl text-lg font-medium transition-all
               {status.power ? (status.moonlight_mode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400') : 'bg-zinc-800 text-zinc-400'}
               hover:scale-[1.02] disabled:opacity-50"
      >
        {status.power ? 'Turn Off' : 'Turn On'}
      </button>

      {#if status.power}
        <!-- Presets -->
        <div>
          <p class="text-sm text-[var(--muted)] mb-2">Presets</p>
          <div class="grid grid-cols-3 gap-2">
            {#each presets as preset}
              <button
                onclick={() => applyPreset(preset)}
                disabled={loading}
                class="py-2.5 text-sm rounded-lg transition-all
                       {isPresetActive(preset)
                         ? (preset.moonlight ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400')
                         : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'}
                       disabled:opacity-50"
              >
                {preset.label}
              </button>
            {/each}
          </div>
        </div>

        {#if !status.moonlight_mode}
          <!-- Brightness -->
          <div>
            <div class="flex justify-between text-sm text-[var(--muted)] mb-2">
              <span>Brightness</span>
              <span class="font-medium text-white">{displayBrightness}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={displayBrightness}
              oninput={(e) => previewBrightness = parseInt(e.currentTarget.value)}
              onchange={(e) => setBrightness(parseInt(e.currentTarget.value))}
              class="w-full"
            />
          </div>

          <!-- Color Temperature -->
          <div>
            <div class="flex justify-between text-sm text-[var(--muted)] mb-2">
              <span>Color Temperature</span>
              <span class="font-medium text-white">{displayColorTemp}K</span>
            </div>
            <input
              type="range"
              min="1700"
              max="6500"
              step="100"
              value={displayColorTemp}
              oninput={(e) => previewColorTemp = parseInt(e.currentTarget.value)}
              onchange={(e) => setColorTemp(parseInt(e.currentTarget.value))}
              class="w-full"
            />
            <div class="flex justify-between text-xs text-[var(--muted)] mt-1">
              <span>Warm</span>
              <span>Cool</span>
            </div>
          </div>
        {:else}
          <!-- Moonlight mode info -->
          <div class="py-4 text-center text-sm text-indigo-400/80">
            Hardware night light mode active
          </div>
        {/if}
      {/if}

      <!-- Device Info -->
      <div class="pt-4 border-t border-[var(--glass-border)] space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-[var(--muted)]">Model</span>
          <span class="font-mono text-xs">{lamp.model}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-[var(--muted)]">IP Address</span>
          <span class="font-mono text-xs">{lamp.ip}</span>
        </div>
      </div>
    {/if}
  </div>
</DeviceDialog>
