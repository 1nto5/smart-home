<script lang="ts">
  import { controlAirPurifier } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import DeviceDialog from './DeviceDialog.svelte';

  let { compact = false }: { compact?: boolean } = $props();
  let status = $derived(store.airPurifier);
  let loading = $state(false);
  let dialogOpen = $state(false);

  async function togglePower() {
    loading = true;
    try {
      await controlAirPurifier({ power: !status?.power });
      await store.refreshAirPurifier();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function setMode(mode: string) {
    try {
      await controlAirPurifier({ mode });
      await store.refreshAirPurifier();
    } catch (e) {
      console.error(e);
    }
  }

  function aqiColor(aqi: number): string {
    if (aqi <= 50) return 'text-green-400 bg-green-500/20';
    if (aqi <= 100) return 'text-yellow-400 bg-yellow-500/20';
    if (aqi <= 150) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
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
  class="glass-card rounded-xl transition-card hover:scale-[1.02] {compact ? 'p-2.5' : 'p-3'} w-full text-left cursor-pointer"
>
  <div class="flex items-center gap-2.5">
    <!-- Power toggle -->
    <button
      onclick={(e) => { e.stopPropagation(); togglePower(); }}
      disabled={loading || !status}
      class="w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0
             {status?.power ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800/60 text-zinc-500'}
             hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      class:status-active={status?.power}
    >
      {#if loading}
        <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      {:else}
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.414 1.415l.708-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clip-rule="evenodd"/>
        </svg>
      {/if}
    </button>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm truncate">Air Purifier</h4>
      {#if status?.power}
        <p class="text-xs text-[var(--muted)]">{modeLabels[status.mode] || status.mode} · {status.aqi} AQI</p>
      {:else}
        <p class="text-xs text-[var(--muted)]">{status ? 'Off' : 'Offline'}</p>
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
      <span class="text-[var(--muted)]">Status</span>
      <span class="font-medium {status?.power ? 'text-cyan-400' : 'text-zinc-500'}">
        {status?.power ? 'On' : status ? 'Off' : 'Offline'}
      </span>
    </div>

    {#if status}
      <!-- Power Button -->
      <button
        onclick={togglePower}
        disabled={loading}
        class="w-full py-4 rounded-xl text-lg font-medium transition-all
               {status.power ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-400'}
               hover:scale-[1.02] disabled:opacity-50"
      >
        {status.power ? 'Turn Off' : 'Turn On'}
      </button>

      {#if status.power}
        <!-- AQI Display -->
        <div class="rounded-xl p-4 text-center {aqiColor(status.aqi)}">
          <span class="text-xs uppercase tracking-wide opacity-80">Air Quality Index</span>
          <p class="text-4xl font-bold mt-1">{status.aqi}</p>
          <p class="text-sm mt-1">{aqiLabel(status.aqi)}</p>
        </div>

        <!-- Mode selector -->
        <div>
          <p class="text-sm text-[var(--muted)] mb-2">Mode</p>
          <div class="grid grid-cols-3 gap-2">
            {#each [{ value: 'auto', label: 'Auto' }, { value: 'silent', label: 'Night' }, { value: 'favorite', label: 'Manual' }] as mode}
              <button
                onclick={() => setMode(mode.value)}
                class="py-3 text-sm rounded-lg transition-colors
                       {status.mode === mode.value ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'}"
              >
                {mode.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3">
          {#if status.humidity !== undefined}
            <div class="bg-zinc-800/40 rounded-xl p-3 text-center">
              <span class="text-xs text-[var(--muted)]">Humidity</span>
              <p class="text-lg font-bold mt-1">{status.humidity}%</p>
            </div>
          {/if}
          {#if status.temperature !== undefined}
            <div class="bg-zinc-800/40 rounded-xl p-3 text-center">
              <span class="text-xs text-[var(--muted)]">Temp</span>
              <p class="text-lg font-bold mt-1">{status.temperature}°C</p>
            </div>
          {/if}
          {#if status.filter_life !== undefined}
            <div class="bg-zinc-800/40 rounded-xl p-3 text-center">
              <span class="text-xs text-[var(--muted)]">Filter</span>
              <p class="text-lg font-bold mt-1 {status.filter_life < 20 ? 'text-red-400' : ''}">{status.filter_life}%</p>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Device Info -->
      <div class="pt-4 border-t border-[var(--glass-border)] space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-[var(--muted)]">Model</span>
          <span class="font-mono text-xs">Xiaomi Air Purifier</span>
        </div>
      </div>
    {/if}
  </div>
</DeviceDialog>
