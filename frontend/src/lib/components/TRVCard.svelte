<script lang="ts">
  import { tick } from 'svelte';
  import type { TuyaDevice } from '$lib/types';
  import { translateDeviceName, getSimplifiedName } from '$lib/translations';
  import { controlTuyaDevice, getTuyaDeviceStatus } from '$lib/api';
  import { debounce } from '$lib/debounce';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Flame, Lock, LockOpen, Power, PowerOff, Snowflake, ThermometerSun } from 'lucide-svelte';

  let { device, compact = false }: { device: TuyaDevice; compact?: boolean } = $props();
  let fullName = $derived(translateDeviceName(device.name));
  let displayName = $derived(compact ? getSimplifiedName(device.name, device.category) : fullName);
  let dialogOpen = $state(false);

  // Optimistic state
  let optimisticTemp = $state<number | null>(null);
  let isPending = $state(false);
  let hasError = $state(false);
  let pendingPreset = $state<number | null>(null);

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

  let switchState = $derived(status()?.['1'] !== undefined ? status()['1'] === true : true);
  let currentTemp = $derived(status()?.['5'] ? status()['5'] / 10 : null);
  let serverTargetTemp = $derived(status()?.['4'] ? status()['4'] / 10 : null);
  let targetTemp = $derived(optimisticTemp ?? serverTargetTemp);
  let valve = $derived(status()?.['3'] || 'unknown');
  let childLock = $derived(status()?.['7'] === true);
  let isDeviceOff = $derived(switchState === false);

  // Child lock state
  let childLockPending = $state(false);

  // Power toggle state
  let powerPending = $state(false);

  // Debounced API call
  const [sendTempDebounced, cancelDebounce] = debounce((temp: number) => {
    sendTemperature(temp);
  }, 500);

  async function sendTemperature(temp: number) {
    isPending = true;
    hasError = false;
    const previousTemp = serverTargetTemp;
    try {
      await controlTuyaDevice(device.id, 4, Math.round(temp * 10));
      refreshStatus();
    } catch (e) {
      console.error(e);
      hasError = true;
      optimisticTemp = previousTemp;
      pendingPreset = null;
      setTimeout(() => (hasError = false), 3000);
    }
  }

  async function refreshStatus() {
    try {
      const data = await getTuyaDeviceStatus(device.id);
      device.last_status = JSON.stringify(data.status);
      optimisticTemp = null;
    } catch (e) {
      console.error(e);
    }
    isPending = false;
    pendingPreset = null;
  }

  function adjustTemp(delta: number) {
    if (targetTemp === null) return;
    const newTemp = Math.max(5, Math.min(30, targetTemp + delta));
    optimisticTemp = newTemp;
    sendTempDebounced(newTemp);
  }

  function setTempDirect(temp: number, fromPreset: boolean = false) {
    optimisticTemp = temp;
    if (fromPreset) pendingPreset = temp;
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

  async function toggleChildLock() {
    const currentLock = status()?.['7'] === true;
    childLockPending = true;
    try {
      await controlTuyaDevice(device.id, 7, !currentLock);
      await refreshStatus();
    } catch (e) {
      console.error('Failed to toggle child lock:', e);
    }
    childLockPending = false;
  }

  async function togglePower() {
    const currentPower = status()?.['1'] === true;
    powerPending = true;
    try {
      await controlTuyaDevice(device.id, 1, !currentPower);
      await refreshStatus();
    } catch (e) {
      console.error('Failed to toggle power:', e);
    }
    powerPending = false;
  }
</script>

<!-- Card -->
<div
  onclick={() => dialogOpen = true}
  onkeydown={(e) => e.key === 'Enter' && (dialogOpen = true)}
  role="button"
  tabindex="0"
  class="card {compact ? 'p-3' : 'p-4'} w-full text-left cursor-pointer
         {isDeviceOff ? '' : valve === 'opened' ? 'card-active glow-climate-heat' : ''}"
>
  <div class="flex items-center gap-3">
    <!-- Valve/Power status indicator -->
    <div
      class="power-btn {isDeviceOff ? 'opacity-50' : valve === 'opened' ? 'power-btn-on glow-climate-heat' : 'glow-climate-cool'}"
      role="img"
      aria-label="{isDeviceOff ? 'Device off' : valve === 'opened' ? 'Heating active' : 'Idle'}"
    >
      {#if isDeviceOff}
        <PowerOff class="w-4 h-4" aria-hidden="true" />
      {:else if valve === 'opened'}
        <Flame class="w-4 h-4" aria-hidden="true" />
      {:else}
        <Snowflake class="w-4 h-4" aria-hidden="true" />
      {/if}
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">{displayName}</h4>
      {#if isDeviceOff}
        <p class="text-xs text-content-tertiary">Off</p>
      {:else if currentTemp !== null}
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
    <!-- Power Toggle -->
    <div class="flex items-center justify-between py-3 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
      <div class="flex items-center gap-2">
        {#if isDeviceOff}
          <PowerOff class="w-4 h-4 text-content-tertiary" />
        {:else}
          <Power class="w-4 h-4 text-success" />
        {/if}
        <span class="text-sm text-content-secondary">Power</span>
      </div>
      <button
        onclick={togglePower}
        disabled={powerPending}
        class="relative w-10 h-6 rounded-full transition-colors {isDeviceOff ? 'bg-content-tertiary/30' : 'bg-success'}"
        aria-label="Toggle power"
      >
        <span
          class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform {isDeviceOff ? '' : 'translate-x-4'}"
        ></span>
        {#if powerPending}
          <span class="absolute inset-0 rounded-full border-2 border-success animate-pulse"></span>
        {/if}
      </button>
    </div>

    {#if isDeviceOff}
      <!-- Device Off Message -->
      <div class="text-center py-8 text-content-tertiary">
        <PowerOff class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Device is off</p>
        <p class="text-xs mt-2">Turn on power to control temperature</p>
      </div>
    {:else}
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
              onclick={() => setTempDirect(temp, true)}
              disabled={pendingPreset !== null}
              class="py-3 rounded-lg transition-all font-medium relative disabled:opacity-50
                     {targetTemp === temp ? 'glow-climate-heat power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
            >
              {temp}°
              {#if pendingPreset === temp}
                <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
              {/if}
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

    <!-- Child Lock Toggle -->
    {#if status()?.['7'] !== undefined}
      <div class="flex items-center justify-between py-3 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
        <div class="flex items-center gap-2">
          {#if childLock}
            <Lock class="w-4 h-4 text-warning" />
          {:else}
            <LockOpen class="w-4 h-4 text-content-tertiary" />
          {/if}
          <span class="text-sm text-content-secondary">Child Lock</span>
        </div>
        <button
          onclick={toggleChildLock}
          disabled={childLockPending}
          class="relative w-10 h-6 rounded-full transition-colors {childLock ? 'bg-warning' : 'bg-content-tertiary/30'}"
          aria-label="Toggle child lock"
        >
          <span
            class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform {childLock ? 'translate-x-4' : ''}"
          ></span>
          {#if childLockPending}
            <span class="absolute inset-0 rounded-full border-2 border-warning animate-pulse"></span>
          {/if}
        </button>
      </div>
    {/if}
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
