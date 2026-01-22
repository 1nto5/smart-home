<script lang="ts">
  import { tick } from 'svelte';
  import type { TuyaDevice } from '$lib/types';
  import { translateDeviceName, getSimplifiedName } from '$lib/translations';
  import { debounce } from '$lib/debounce';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Flame, Snowflake, ThermometerSun } from 'lucide-svelte';

  let { device, compact = false }: { device: TuyaDevice; compact?: boolean } = $props();
  let fullName = $derived(translateDeviceName(device.name));
  let displayName = $derived(compact ? getSimplifiedName(device.name, device.category) : fullName);
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
  class="card {compact ? 'p-3' : 'p-4'} w-full text-left cursor-pointer
         {valve === 'opened' ? 'card-active glow-climate-heat' : ''}"
>
  <div class="flex items-center gap-3">
    <!-- Valve status indicator -->
    <div
      class="power-btn {valve === 'opened' ? 'power-btn-on glow-climate-heat' : 'glow-climate-cool'}"
      role="img"
      aria-label="{valve === 'opened' ? 'Heating active' : 'Idle'}"
    >
      {#if valve === 'opened'}
        <Flame class="w-4 h-4" aria-hidden="true" />
      {:else}
        <Snowflake class="w-4 h-4" aria-hidden="true" />
      {/if}
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">{displayName}</h4>
      {#if currentTemp !== null}
        <p class="text-xs text-content-secondary">
          <span class="{valve === 'opened' ? 'text-device-climate-heat-text' : ''}">{currentTemp}°C</span>
          <span class="mx-1 text-content-tertiary">/</span>
          <span class="text-device-climate-heat-text">{targetTemp}°C</span>
        </p>
      {:else}
        <p class="text-xs text-content-tertiary">No data</p>
      {/if}
    </div>
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title={fullName}>
  <div class="space-y-5">
    <!-- Valve Status -->
    <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
      <span class="text-sm text-content-secondary uppercase tracking-wider">Valve</span>
      <span class="font-medium text-sm {valve === 'opened' ? 'text-device-climate-heat-text neon-text-subtle' : 'text-device-climate-cool-text neon-text-subtle'}">
        {valve === 'opened' ? 'Heating' : 'Idle'}
      </span>
    </div>

    {#if currentTemp !== null && targetTemp !== null}
      <!-- Temperature Display -->
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl p-4 text-center bg-surface-recessed border border-stroke-subtle">
          <span class="text-xs text-content-tertiary uppercase tracking-wider">Current</span>
          <p class="font-display text-3xl mt-2 text-content-primary">{currentTemp}°</p>
        </div>
        <div class="rounded-xl p-4 text-center glow-climate-heat power-btn-on">
          <span class="text-xs uppercase tracking-wider opacity-80">Target</span>
          <p class="font-display text-3xl mt-2">{targetTemp}°</p>
        </div>
      </div>

      <!-- Temperature Control -->
      <div>
        <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Set Temperature</p>
        <div class="flex items-center justify-center gap-4">
          <button
            onclick={() => adjustTemp(-0.5)}
            disabled={targetTemp !== null && targetTemp <= 5}
            aria-label="Decrease temperature"
            class="w-14 h-14 rounded-full glow-climate-cool power-btn-on text-2xl font-medium
                   hover:scale-105 disabled:opacity-40 transition-all"
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
                class="font-display text-3xl w-28 text-center bg-transparent border-b-2 border-device-climate-heat-text outline-none text-content-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onblur={commitEdit}
                onkeydown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
              />
            {:else}
              <button
                onclick={startEditing}
                class="font-display text-3xl w-28 text-center text-content-primary hover:text-device-climate-heat-text transition-colors cursor-text"
                title="Click to edit"
              >
                {targetTemp}°C
              </button>
            {/if}
            {#if isPending}
              <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-device-climate-heat-text animate-glow"></span>
            {/if}
            {#if hasError}
              <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-error"></span>
            {/if}
          </div>
          <button
            onclick={() => adjustTemp(0.5)}
            disabled={targetTemp !== null && targetTemp >= 30}
            aria-label="Increase temperature"
            class="w-14 h-14 rounded-full glow-climate-heat power-btn-on text-2xl font-medium
                   hover:scale-105 disabled:opacity-40 transition-all"
          >+</button>
        </div>
      </div>

      <!-- Quick Presets -->
      <div>
        <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Quick Set</p>
        <div class="grid grid-cols-5 gap-2">
          {#each [5, 15, 18, 21, 24] as temp}
            <button
              onclick={() => setTempDirect(temp)}
              class="py-3 rounded-lg transition-all font-medium
                     {targetTemp === temp ? 'glow-climate-heat power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
            >
              {temp}°
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <div class="text-center py-8 text-content-tertiary">
        <ThermometerSun class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No data available</p>
      </div>
    {/if}

    <!-- Device Info -->
    <div class="pt-4 border-t border-stroke-subtle space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-xs text-content-tertiary uppercase tracking-wider">Online</span>
        <span class="text-xs {device.online ? 'text-success' : 'text-error'}">{device.online ? 'Connected' : 'Offline'}</span>
      </div>
    </div>
  </div>
</DeviceDialog>
