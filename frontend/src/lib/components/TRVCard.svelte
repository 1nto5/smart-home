<script lang="ts">
  import { tick } from 'svelte';
  import type { TuyaDevice } from '$lib/types';
  import { translateDeviceName } from '$lib/translations';
  import { debounce } from '$lib/debounce';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Flame, Radio } from 'lucide-svelte';

  let { device, compact = false }: { device: TuyaDevice; compact?: boolean } = $props();
  let displayName = $derived(translateDeviceName(device.name));
  let dialogOpen = $state(false);

  // Optimistic state
  let optimisticTemp = $state<number | null>(null);
  let isPending = $state(false);
  let hasError = $state(false);

  // Edit mode
  let isEditing = $state(false);
  let inputValue = $state('');
  let inputRef = $state<HTMLInputElement | null>(null);

  let status = $derived(() => {
    if (!device.last_status) return null;
    try {
      return JSON.parse(device.last_status);
    } catch {
      return null;
    }
  });

  let currentTemp = $derived(status()?.['5'] ? status()['5'] / 10 : null);
  let serverTargetTemp = $derived(status()?.['4'] ? status()['4'] / 10 : null);
  let targetTemp = $derived(optimisticTemp ?? serverTargetTemp);
  let valve = $derived(status()?.['3'] || 'unknown');

  // Debounced API call
  const [sendTempDebounced, cancelDebounce] = debounce((temp: number) => {
    sendTemperature(temp);
  }, 500);

  async function sendTemperature(temp: number) {
    isPending = true;
    hasError = false;
    const previousTemp = serverTargetTemp;
    try {
      await fetch(`/api/devices/${device.id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dps: 4, value: Math.round(temp * 10) }),
      });
      // Background refresh
      refreshStatus();
    } catch (e) {
      console.error(e);
      hasError = true;
      optimisticTemp = previousTemp;
      setTimeout(() => (hasError = false), 3000);
    }
  }

  async function refreshStatus() {
    try {
      const res = await fetch(`/api/devices/${device.id}/status`);
      if (res.ok) {
        const data = await res.json();
        device.last_status = JSON.stringify(data.status);
        optimisticTemp = null;
      }
    } catch (e) {
      console.error(e);
    }
    isPending = false;
  }

  function adjustTemp(delta: number) {
    if (targetTemp === null) return;
    const newTemp = Math.max(5, Math.min(30, targetTemp + delta));
    optimisticTemp = newTemp;
    sendTempDebounced(newTemp);
  }

  function setTempDirect(temp: number) {
    optimisticTemp = temp;
    cancelDebounce();
    sendTemperature(temp);
  }

  function startEditing() {
    if (targetTemp === null) return;
    inputValue = targetTemp.toString();
    isEditing = true;
    tick().then(() => inputRef?.select());
  }

  function commitEdit() {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed >= 5 && parsed <= 30) {
      const rounded = Math.round(parsed * 2) / 2;
      setTempDirect(rounded);
    }
    isEditing = false;
  }

  function cancelEdit() {
    isEditing = false;
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
    <!-- Valve status indicator -->
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
             {valve === 'opened' ? 'badge-climate-heat' : 'badge-climate-cool'}"
      class:status-active={valve === 'opened'}
    >
      {#if valve === 'opened'}
        <Flame class="w-4 h-4" />
      {:else}
        <Radio class="w-4 h-4" />
      {/if}
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">{displayName}</h4>
      {#if currentTemp !== null}
        <p class="text-xs text-content-secondary">
          {currentTemp}°C {valve === 'opened' ? '→' : '·'} {targetTemp}°C
        </p>
      {:else}
        <p class="text-xs text-content-secondary">No data</p>
      {/if}
    </div>
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title={displayName}>
  <div class="space-y-4">
    <!-- Valve Status -->
    <div class="flex items-center justify-between">
      <span class="text-content-secondary">Valve</span>
      <span class="font-medium {valve === 'opened' ? 'text-device-climate-heat-text' : 'text-device-climate-cool-text'}">
        {valve === 'opened' ? 'Heating' : 'Idle'}
      </span>
    </div>

    {#if currentTemp !== null && targetTemp !== null}
      <!-- Temperature Display -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-surface-recessed rounded-xl p-4 text-center">
          <span class="text-xs text-content-secondary uppercase tracking-wide">Current</span>
          <p class="text-2xl sm:text-3xl font-bold mt-1 text-content-primary">{currentTemp}°C</p>
        </div>
        <div class="bg-surface-recessed rounded-xl p-4 text-center">
          <span class="text-xs text-content-secondary uppercase tracking-wide">Target</span>
          <p class="text-2xl sm:text-3xl font-bold mt-1 text-device-climate-heat-text">{targetTemp}°C</p>
        </div>
      </div>

      <!-- Temperature Control -->
      <div>
        <p class="text-sm text-content-secondary mb-3">Set Temperature</p>
        <div class="flex items-center justify-center gap-4">
          <button
            onclick={() => adjustTemp(-0.5)}
            disabled={targetTemp !== null && targetTemp <= 5}
            class="w-14 h-14 rounded-full badge-climate-cool text-2xl font-medium
                   hover:opacity-80 disabled:opacity-50 transition-all"
          >−</button>
          <div class="relative">
            {#if isEditing}
              <input
                bind:this={inputRef}
                bind:value={inputValue}
                type="number"
                min="5"
                max="30"
                step="0.5"
                class="text-3xl font-bold w-24 text-center bg-transparent border-b-2 border-device-climate-heat-text outline-none text-content-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onblur={commitEdit}
                onkeydown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
              />
            {:else}
              <button
                onclick={startEditing}
                class="text-3xl font-bold w-24 text-center text-content-primary hover:text-device-climate-heat-text transition-colors cursor-text"
                title="Click to edit"
              >
                {targetTemp}°C
              </button>
            {/if}
            {#if isPending}
              <span class="absolute -top-1 -right-1 w-2 h-2 bg-device-climate-heat-text rounded-full animate-pulse"></span>
            {/if}
            {#if hasError}
              <span class="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
            {/if}
          </div>
          <button
            onclick={() => adjustTemp(0.5)}
            disabled={targetTemp !== null && targetTemp >= 30}
            class="w-14 h-14 rounded-full badge-climate-heat text-2xl font-medium
                   hover:opacity-80 disabled:opacity-50 transition-all"
          >+</button>
        </div>
      </div>

      <!-- Quick Presets -->
      <div>
        <p class="text-sm text-content-secondary mb-2">Quick Set</p>
        <div class="grid grid-cols-4 gap-2">
          {#each [15, 18, 21, 24] as temp}
            <button
              onclick={() => setTempDirect(temp)}
              class="py-2 text-sm rounded-lg transition-colors
                     {targetTemp === temp ? 'badge-climate-heat' : 'bg-surface-recessed text-content-secondary hover:bg-stroke-default'}"
            >
              {temp}°
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <div class="text-center py-8 text-content-secondary">
        No data available
      </div>
    {/if}

    <!-- Device Info -->
    <div class="pt-4 border-t border-stroke-default space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-content-secondary">Device ID</span>
        <span class="font-mono text-xs text-content-tertiary">{device.id.slice(0, 12)}...</span>
      </div>
      <div class="flex justify-between">
        <span class="text-content-secondary">Online</span>
        <span class="{device.online ? 'text-success' : 'text-error'}">{device.online ? 'Yes' : 'No'}</span>
      </div>
    </div>
  </div>
</DeviceDialog>
