<script lang="ts">
  import { tick } from 'svelte';
  import type { HeaterPreset, HeaterPresetDevice, TuyaDevice } from '$lib/types';
  import { updateHeaterPreset, applyHeaterPreset, deleteHeaterPreset, getPresetDeviceTemps, setPresetDeviceTemp, deletePresetDeviceTemp } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import { getSimplifiedName } from '$lib/translations';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Play, Trash2, RotateCcw } from 'lucide-svelte';

  let {
    preset,
    trvDevices,
    open = $bindable(false),
    onclose
  }: {
    preset: HeaterPreset;
    trvDevices: TuyaDevice[];
    open: boolean;
    onclose: () => void;
  } = $props();

  let loading = $state(false);

  // Default temp editing
  let isEditingDefault = $state(false);
  let defaultTempValue = $state(preset.target_temp);
  let defaultInputRef = $state<HTMLInputElement | null>(null);

  // Per-device temps
  let presetDeviceTemps = $state<HeaterPresetDevice[]>([]);
  let editingDeviceId = $state<string | null>(null);
  let deviceTempValue = $state(21);

  // Load per-device temps when dialog opens
  $effect(() => {
    if (open && preset) {
      defaultTempValue = preset.target_temp;
      loadDeviceTemps();
    }
  });

  async function loadDeviceTemps() {
    presetDeviceTemps = await getPresetDeviceTemps(preset.id);
  }

  function getDeviceTemp(deviceId: string): { temp: number; isCustom: boolean } {
    const custom = presetDeviceTemps.find(d => d.device_id === deviceId);
    return custom
      ? { temp: custom.target_temp, isCustom: true }
      : { temp: preset.target_temp, isCustom: false };
  }

  // Default temp functions
  function startEditDefault() {
    defaultTempValue = preset.target_temp;
    isEditingDefault = true;
    tick().then(() => defaultInputRef?.select());
  }

  async function saveDefaultTemp() {
    loading = true;
    try {
      await updateHeaterPreset(preset.id, defaultTempValue);
      await store.refreshHeaterPresets();
      isEditingDefault = false;
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  function adjustDefaultTemp(delta: number) {
    const newTemp = Math.max(5, Math.min(30, defaultTempValue + delta));
    defaultTempValue = newTemp;
  }

  // Per-device temp functions
  function startEditDeviceTemp(deviceId: string, currentTemp: number) {
    editingDeviceId = deviceId;
    deviceTempValue = currentTemp;
  }

  async function saveDeviceTemp(deviceId: string) {
    loading = true;
    try {
      await setPresetDeviceTemp(preset.id, deviceId, deviceTempValue);
      await loadDeviceTemps();
      editingDeviceId = null;
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function resetDeviceTemp(deviceId: string) {
    loading = true;
    try {
      await deletePresetDeviceTemp(preset.id, deviceId);
      await loadDeviceTemps();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  // Actions
  async function handleApply() {
    loading = true;
    try {
      await applyHeaterPreset(preset.id);
      await store.refreshPendingHeater();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleDelete() {
    if (!confirm(`Delete preset "${preset.name}"? This will also delete any schedules using this preset.`)) return;
    loading = true;
    try {
      await deleteHeaterPreset(preset.id);
      await store.refreshHeaterPresets();
      await store.refreshHeaterSchedules();
      onclose();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }
</script>

<DeviceDialog {open} {onclose} title={preset.name}>
  <div class="space-y-5">
    <!-- Default Temperature -->
    <div>
      <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Default Temperature</p>
      <div class="flex items-center justify-center gap-4">
        <button
          onclick={() => adjustDefaultTemp(-0.5)}
          disabled={defaultTempValue <= 5}
          class="w-14 h-14 rounded-full glow-climate-cool power-btn-on text-2xl font-medium
                 hover:scale-105 disabled:opacity-40 transition-all"
        >−</button>
        <div class="relative">
          {#if isEditingDefault}
            <input
              bind:this={defaultInputRef}
              bind:value={defaultTempValue}
              type="number"
              min="5"
              max="30"
              step="0.5"
              class="font-display text-3xl w-28 text-center bg-transparent border-b-2 border-device-climate-heat-text outline-none text-content-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              onblur={saveDefaultTemp}
              onkeydown={(e) => {
                if (e.key === 'Enter') saveDefaultTemp();
                if (e.key === 'Escape') { isEditingDefault = false; defaultTempValue = preset.target_temp; }
              }}
            />
          {:else}
            <button
              onclick={startEditDefault}
              class="font-display text-3xl w-28 text-center text-device-climate-heat-text neon-text-subtle hover:scale-105 transition-transform cursor-text"
              title="Click to edit"
            >
              {preset.target_temp}°C
            </button>
          {/if}
        </div>
        <button
          onclick={() => adjustDefaultTemp(0.5)}
          disabled={defaultTempValue >= 30}
          class="w-14 h-14 rounded-full glow-climate-heat power-btn-on text-2xl font-medium
                 hover:scale-105 disabled:opacity-40 transition-all"
        >+</button>
      </div>
    </div>

    <!-- Per-device Overrides -->
    <div>
      <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">
        Per-device Overrides <span class="text-content-secondary">(override {preset.target_temp}°C)</span>
      </p>
      {#if trvDevices.length === 0}
        <p class="text-sm text-content-tertiary">No TRV devices found</p>
      {:else}
        <div class="space-y-2">
          {#each trvDevices as device (device.id)}
            {@const tempInfo = getDeviceTemp(device.id)}
            <div class="flex items-center justify-between bg-surface-recessed rounded-lg p-3 border border-stroke-subtle">
              <span class="text-sm text-content-primary">{getSimplifiedName(device.name, 'wkf') || device.id}</span>
              <div class="flex items-center gap-2">
                {#if editingDeviceId === device.id}
                  <input
                    type="number"
                    min="5"
                    max="30"
                    step="0.5"
                    bind:value={deviceTempValue}
                    class="bg-surface-elevated border border-stroke-default rounded px-2 py-1 w-16 text-content-primary text-center text-sm font-display focus:outline-none focus:border-device-climate-heat-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onclick={() => saveDeviceTemp(device.id)}
                    disabled={loading}
                    class="text-xs px-2 py-1 bg-success/20 text-success border border-success/30 rounded disabled:opacity-50 hover:bg-success/30 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onclick={() => editingDeviceId = null}
                    class="text-xs px-2 py-1 bg-surface-elevated border border-stroke-default text-content-secondary rounded hover:border-stroke-strong transition-colors"
                  >
                    Cancel
                  </button>
                {:else}
                  <button
                    onclick={() => startEditDeviceTemp(device.id, tempInfo.temp)}
                    class="font-display text-sm {tempInfo.isCustom ? 'text-device-climate-heat-text' : 'text-content-secondary'} hover:text-device-climate-heat-text transition-colors"
                  >
                    {tempInfo.temp}°C {tempInfo.isCustom ? '' : '(default)'}
                  </button>
                  {#if tempInfo.isCustom}
                    <button
                      onclick={() => resetDeviceTemp(device.id)}
                      disabled={loading}
                      class="p-1.5 rounded bg-surface-elevated border border-stroke-subtle text-content-tertiary hover:text-content-secondary transition-colors disabled:opacity-50"
                      title="Reset to default"
                    >
                      <RotateCcw class="w-3 h-3" />
                    </button>
                  {/if}
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Action Buttons -->
    <div class="pt-4 border-t border-stroke-subtle flex gap-3">
      <button
        onclick={handleApply}
        disabled={loading}
        class="flex-1 py-3 rounded-lg glow-climate-heat power-btn-on font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 transition-all"
      >
        <Play class="w-4 h-4" />
        Apply
      </button>
      <button
        onclick={handleDelete}
        disabled={loading}
        class="px-6 py-3 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:bg-error/10 hover:text-error hover:border-error/30 disabled:opacity-50 transition-all"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</DeviceDialog>
