<script lang="ts">
  import type { TuyaDevice } from '$lib/types';
  import { translateDeviceName } from '$lib/translations';
  import DeviceDialog from './DeviceDialog.svelte';

  let { device, compact = false }: { device: TuyaDevice; compact?: boolean } = $props();
  let displayName = $derived(translateDeviceName(device.name));
  let loading = $state(false);
  let dialogOpen = $state(false);

  let status = $derived(() => {
    if (!device.last_status) return null;
    try {
      return JSON.parse(device.last_status);
    } catch {
      return null;
    }
  });

  let currentTemp = $derived(status()?.['5'] ? status()['5'] / 10 : null);
  let targetTemp = $derived(status()?.['4'] ? status()['4'] / 10 : null);
  let valve = $derived(status()?.['3'] || 'unknown');

  async function setTemperature(temp: number) {
    loading = true;
    try {
      await fetch(`/api/devices/${device.id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dps: 4, value: Math.round(temp * 10) }),
      });
      const res = await fetch(`/api/devices/${device.id}/status`);
      if (res.ok) {
        const data = await res.json();
        device.last_status = JSON.stringify(data.status);
      }
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  function adjustTemp(delta: number) {
    if (targetTemp !== null) {
      const newTemp = Math.max(5, Math.min(30, targetTemp + delta));
      setTemperature(newTemp);
    }
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
    <!-- Valve status indicator -->
    <div
      class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0
             {valve === 'opened' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}"
      class:status-active={valve === 'opened'}
    >
      {#if valve === 'opened'}
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/>
        </svg>
      {:else}
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z"/>
        </svg>
      {/if}
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm truncate">{displayName}</h4>
      {#if currentTemp !== null}
        <p class="text-xs text-[var(--muted)]">
          {currentTemp}°C {valve === 'opened' ? '→' : '·'} {targetTemp}°C
        </p>
      {:else}
        <p class="text-xs text-[var(--muted)]">No data</p>
      {/if}
    </div>
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title={displayName}>
  <div class="space-y-4">
    <!-- Valve Status -->
    <div class="flex items-center justify-between">
      <span class="text-[var(--muted)]">Valve</span>
      <span class="font-medium {valve === 'opened' ? 'text-orange-400' : 'text-blue-400'}">
        {valve === 'opened' ? 'Heating' : 'Idle'}
      </span>
    </div>

    {#if currentTemp !== null && targetTemp !== null}
      <!-- Temperature Display -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-zinc-800/40 rounded-xl p-4 text-center">
          <span class="text-xs text-[var(--muted)] uppercase tracking-wide">Current</span>
          <p class="text-3xl font-bold mt-1">{currentTemp}°C</p>
        </div>
        <div class="bg-zinc-800/40 rounded-xl p-4 text-center">
          <span class="text-xs text-[var(--muted)] uppercase tracking-wide">Target</span>
          <p class="text-3xl font-bold mt-1 text-orange-400">{targetTemp}°C</p>
        </div>
      </div>

      <!-- Temperature Control -->
      <div>
        <p class="text-sm text-[var(--muted)] mb-3">Set Temperature</p>
        <div class="flex items-center justify-center gap-4">
          <button
            onclick={() => adjustTemp(-0.5)}
            disabled={loading || targetTemp <= 5}
            class="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 text-2xl font-medium
                   hover:bg-blue-500/30 disabled:opacity-50 transition-all"
          >−</button>
          <span class="text-3xl font-bold w-24 text-center">{targetTemp}°C</span>
          <button
            onclick={() => adjustTemp(0.5)}
            disabled={loading || targetTemp >= 30}
            class="w-14 h-14 rounded-full bg-orange-500/20 text-orange-400 text-2xl font-medium
                   hover:bg-orange-500/30 disabled:opacity-50 transition-all"
          >+</button>
        </div>
      </div>

      <!-- Quick Presets -->
      <div>
        <p class="text-sm text-[var(--muted)] mb-2">Quick Set</p>
        <div class="grid grid-cols-4 gap-2">
          {#each [15, 18, 21, 24] as temp}
            <button
              onclick={() => setTemperature(temp)}
              disabled={loading}
              class="py-2 text-sm rounded-lg transition-colors
                     {targetTemp === temp ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'}"
            >
              {temp}°
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <div class="text-center py-8 text-[var(--muted)]">
        No data available
      </div>
    {/if}

    <!-- Device Info -->
    <div class="pt-4 border-t border-[var(--glass-border)] space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-[var(--muted)]">Device ID</span>
        <span class="font-mono text-xs">{device.id.slice(0, 12)}...</span>
      </div>
      <div class="flex justify-between">
        <span class="text-[var(--muted)]">Online</span>
        <span class="{device.online ? 'text-green-400' : 'text-red-400'}">{device.online ? 'Yes' : 'No'}</span>
      </div>
    </div>
  </div>
</DeviceDialog>
