<script lang="ts">
  import { store } from '$lib/stores.svelte';
  import { createHeaterSchedule, deleteHeaterSchedule, toggleHeaterSchedule, clearPendingHeaterActions, updateHeaterPreset, applyHeaterPreset, setHeaterOverride, createHeaterPreset, deleteHeaterPreset, getTuyaDevices, getPresetDeviceTemps, setPresetDeviceTemp, deletePresetDeviceTemp } from '$lib/api';
  import { Thermometer, Clock, Trash2, Plus, Play, PauseCircle, X, ChevronDown, ChevronUp, RotateCcw, AlertCircle, Flame } from 'lucide-svelte';
  import type { HeaterPreset, HeaterPresetDevice, TuyaDevice } from '$lib/types';
  import { browser } from '$app/environment';

  let newName = $state('');
  let newPresetId = $state('night');
  let newTime = $state('22:00');
  let loading = $state(false);
  let editingPreset = $state<string | null>(null);
  let editTemp = $state(21);

  // Override mode state
  let selectedOverrideMode = $state<'pause' | 'fixed'>('pause');
  let overrideTemp = $state(18);

  // Per-device temps state
  let expandedPreset = $state<string | null>(null);
  let trvDevices = $state<TuyaDevice[]>([]);
  let presetDeviceTemps = $state<HeaterPresetDevice[]>([]);
  let editingDeviceTemp = $state<string | null>(null);
  let deviceTempValue = $state(21);

  // Sync local state with store
  $effect(() => {
    if (store.heaterOverride) {
      selectedOverrideMode = store.heaterOverride.mode;
      overrideTemp = store.heaterOverride.fixed_temp;
    }
  });

  // Load TRV devices on mount
  $effect(() => {
    if (browser) {
      getTuyaDevices().then(devices => {
        trvDevices = devices.filter(d => d.category === 'wkf');
      });
    }
  });

  async function toggleExpandPreset(presetId: string) {
    if (expandedPreset === presetId) {
      expandedPreset = null;
      presetDeviceTemps = [];
    } else {
      expandedPreset = presetId;
      presetDeviceTemps = await getPresetDeviceTemps(presetId);
    }
    editingDeviceTemp = null;
  }

  function getDeviceTemp(deviceId: string, defaultTemp: number): { temp: number; isCustom: boolean } {
    const custom = presetDeviceTemps.find(d => d.device_id === deviceId);
    return custom
      ? { temp: custom.target_temp, isCustom: true }
      : { temp: defaultTemp, isCustom: false };
  }

  function startEditDeviceTemp(deviceId: string, currentTemp: number) {
    editingDeviceTemp = deviceId;
    deviceTempValue = currentTemp;
  }

  async function saveDeviceTemp(presetId: string, deviceId: string) {
    loading = true;
    try {
      await setPresetDeviceTemp(presetId, deviceId, deviceTempValue);
      presetDeviceTemps = await getPresetDeviceTemps(presetId);
      editingDeviceTemp = null;
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function resetDeviceTemp(presetId: string, deviceId: string) {
    loading = true;
    try {
      await deletePresetDeviceTemp(presetId, deviceId);
      presetDeviceTemps = await getPresetDeviceTemps(presetId);
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleOverrideToggle() {
    loading = true;
    const newEnabled = !store.heaterOverride?.enabled;
    try {
      await setHeaterOverride(newEnabled, selectedOverrideMode, overrideTemp);
      await store.refreshHeaterOverride();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleOverrideUpdate(mode?: 'pause' | 'fixed') {
    if (!store.heaterOverride?.enabled) return;
    loading = true;
    const useMode = mode ?? selectedOverrideMode;
    try {
      await setHeaterOverride(true, useMode, overrideTemp);
      await store.refreshHeaterOverride();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    loading = true;
    try {
      await createHeaterSchedule(newName.trim(), newPresetId, newTime);
      newName = '';
      await store.refreshHeaterSchedules();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleDelete(id: number) {
    await deleteHeaterSchedule(id);
    await store.refreshHeaterSchedules();
  }

  async function handleToggle(id: number) {
    await toggleHeaterSchedule(id);
    await store.refreshHeaterSchedules();
  }

  async function handleClearPending() {
    await clearPendingHeaterActions();
    await store.refreshPendingHeater();
  }

  function startEditPreset(preset: HeaterPreset) {
    editingPreset = preset.id;
    editTemp = preset.target_temp;
  }

  async function savePreset(id: string) {
    await updateHeaterPreset(id, editTemp);
    editingPreset = null;
    await store.refreshHeaterPresets();
  }

  function cancelEdit() {
    editingPreset = null;
  }

  // New preset state
  let showNewPresetForm = $state(false);
  let createPresetIdVal = $state('');
  let createPresetName = $state('');
  let createPresetTemp = $state(20);

  async function handleCreatePreset() {
    if (!createPresetIdVal.trim() || !createPresetName.trim()) return;
    loading = true;
    try {
      const id = createPresetIdVal.trim().toLowerCase().replace(/\s+/g, '-');
      await createHeaterPreset(id, createPresetName.trim(), createPresetTemp);
      createPresetIdVal = '';
      createPresetName = '';
      createPresetTemp = 20;
      showNewPresetForm = false;
      await store.refreshHeaterPresets();
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to create preset');
    }
    loading = false;
  }

  async function handleDeletePreset(id: string) {
    if (!confirm(`Delete preset "${id}"? This will also delete any schedules using this preset.`)) return;
    loading = true;
    try {
      await deleteHeaterPreset(id);
      await store.refreshHeaterPresets();
      await store.refreshHeaterSchedules();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleApplyPreset(id: string) {
    loading = true;
    try {
      const result = await applyHeaterPreset(id);
      console.log('Applied preset:', result);
      await store.refreshPendingHeater();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  function getPresetName(presetId: string): string {
    const preset = store.heaterPresets.find(p => p.id === presetId);
    return preset?.name ?? presetId;
  }

  function getDeviceName(deviceId: string): string {
    const device = trvDevices.find(d => d.id === deviceId);
    return device?.name ?? deviceId;
  }
</script>

<svelte:head>
  <title>Smart Home - Heater Schedule</title>
</svelte:head>

<div class="space-y-8 pb-24">
  <!-- Override Mode -->
  <section class="card {store.heaterOverride?.enabled ? 'card-active border-warning/50' : ''}">
    <div class="p-4">
      <div class="section-header section-header-warning mb-4">
        <div class="section-icon" style="background: color-mix(in srgb, var(--color-warning) 15%, transparent); border-color: color-mix(in srgb, var(--color-warning) 30%, transparent); color: var(--color-warning);">
          <PauseCircle class="w-4 h-4" />
        </div>
        <h2 class="section-title" style="color: var(--color-warning);">Override Mode</h2>
        <div class="section-line" style="background: linear-gradient(90deg, color-mix(in srgb, var(--color-warning) 40%, transparent) 0%, transparent 100%);"></div>
        <button
          onclick={handleOverrideToggle}
          disabled={loading}
          class="ml-3 px-4 py-2 rounded-lg font-semibold uppercase tracking-wider text-sm transition-all disabled:opacity-50
                 {store.heaterOverride?.enabled
                   ? 'bg-warning/20 text-warning border border-warning/50 shadow-[0_0_15px_-3px] shadow-warning/40'
                   : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
        >
          {store.heaterOverride?.enabled ? 'Active' : 'Off'}
        </button>
      </div>

      {#if store.heaterOverride?.enabled}
        <div class="rounded-lg p-3 mb-4 bg-warning/10 border border-warning/30 flex items-center gap-2">
          <AlertCircle class="w-4 h-4 text-warning shrink-0" />
          <p class="text-sm text-warning">Schedules paused while override active</p>
        </div>
      {/if}

      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="overrideMode"
              value="pause"
              checked={selectedOverrideMode === 'pause'}
              onchange={() => { selectedOverrideMode = 'pause'; handleOverrideUpdate('pause'); }}
              class="sr-only peer"
            />
            <div class="w-4 h-4 rounded-full border-2 border-stroke-default peer-checked:border-warning peer-checked:bg-warning/20 transition-colors flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-warning scale-0 peer-checked:scale-100 transition-transform"></div>
            </div>
            <span class="text-content-primary text-sm group-hover:text-warning transition-colors">Pause schedules</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="overrideMode"
              value="fixed"
              checked={selectedOverrideMode === 'fixed'}
              onchange={() => { selectedOverrideMode = 'fixed'; handleOverrideUpdate('fixed'); }}
              class="sr-only peer"
            />
            <div class="w-4 h-4 rounded-full border-2 border-stroke-default peer-checked:border-warning peer-checked:bg-warning/20 transition-colors flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-warning scale-0 peer-checked:scale-100 transition-transform"></div>
            </div>
            <span class="text-content-primary text-sm group-hover:text-warning transition-colors">Fixed temperature</span>
          </label>
        </div>

        {#if selectedOverrideMode === 'fixed'}
          <div class="flex items-center gap-3 p-2 rounded-lg bg-surface-recessed border border-stroke-subtle">
            <input
              type="range"
              min="5"
              max="25"
              step="0.5"
              bind:value={overrideTemp}
              onchange={() => handleOverrideUpdate()}
              class="w-32"
              style="--color-accent: var(--color-warning); --color-accent-glow: color-mix(in srgb, var(--color-warning) 50%, transparent);"
            />
            <span class="font-display text-xl text-warning neon-text-subtle w-16">{overrideTemp}°C</span>
          </div>
        {/if}
      </div>
    </div>
  </section>

  <!-- Presets -->
  <section>
    <div class="section-header section-header-climate">
      <div class="section-icon glow-climate-heat">
        <Thermometer class="w-4 h-4" />
      </div>
      <h2 class="section-title">Heater Presets</h2>
      <span class="section-count">{store.heaterPresets.length}</span>
      <div class="section-line"></div>
      <button
        onclick={() => showNewPresetForm = !showNewPresetForm}
        class="ml-3 px-3 py-1.5 rounded-lg glow-climate-heat power-btn-on text-sm font-medium flex items-center gap-1.5 transition-transform hover:scale-105"
      >
        <Plus class="w-4 h-4" />
        Add
      </button>
    </div>

    <!-- New Preset Form -->
    {#if showNewPresetForm}
      <div class="card card-active glow-climate-heat mb-4">
        <div class="p-4">
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Preset ID (e.g. away)"
              bind:value={createPresetIdVal}
              class="flex-1 bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 text-content-primary placeholder:text-content-tertiary focus:border-device-climate-heat-text focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Display name (e.g. Away)"
              bind:value={createPresetName}
              class="flex-1 bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 text-content-primary placeholder:text-content-tertiary focus:border-device-climate-heat-text focus:outline-none transition-colors"
            />
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-recessed border border-stroke-subtle">
              <input
                type="number"
                min="5"
                max="30"
                step="0.5"
                bind:value={createPresetTemp}
                class="bg-transparent w-16 text-content-primary text-center font-display focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span class="text-device-climate-heat-text font-display">°C</span>
            </div>
            <button
              onclick={handleCreatePreset}
              disabled={loading || !createPresetIdVal.trim() || !createPresetName.trim()}
              class="px-4 py-2.5 rounded-lg glow-climate-heat power-btn-on font-semibold uppercase tracking-wider disabled:opacity-50 transition-all"
            >
              Create
            </button>
            <button
              onclick={() => showNewPresetForm = false}
              class="px-3 py-2.5 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Preset List -->
    <div class="space-y-3">
      {#each store.heaterPresets as preset (preset.id)}
        <div class="card overflow-hidden hover:border-device-climate-heat-text/30 transition-colors">
          <div class="p-4 relative group">
            <button
              onclick={() => handleDeletePreset(preset.id)}
              class="absolute top-2 right-2 p-1.5 rounded-lg bg-error/10 text-error border border-error/30 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20"
              title="Delete preset"
            >
              <X class="w-3 h-3" />
            </button>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg glow-climate-heat power-btn-on flex items-center justify-center">
                  <Flame class="w-5 h-5" />
                </div>
                <div>
                  <span class="font-display text-sm uppercase tracking-wider text-content-primary">{preset.name}</span>
                  {#if editingPreset === preset.id}
                    <div class="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        min="5"
                        max="30"
                        step="0.5"
                        bind:value={editTemp}
                        class="bg-surface-recessed border border-stroke-default rounded px-2 py-1 w-16 text-content-primary text-center font-display focus:outline-none focus:border-device-climate-heat-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span class="text-device-climate-heat-text">°C</span>
                      <button
                        onclick={() => savePreset(preset.id)}
                        class="text-xs px-2 py-1 bg-success/20 text-success border border-success/30 rounded hover:bg-success/30 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onclick={cancelEdit}
                        class="text-xs px-2 py-1 bg-surface-recessed border border-stroke-default text-content-secondary rounded hover:border-stroke-strong transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  {:else}
                    <button
                      onclick={() => startEditPreset(preset)}
                      class="font-display text-2xl text-device-climate-heat-text neon-text-subtle hover:scale-105 transition-transform mt-0.5 block"
                    >
                      {preset.target_temp}°C
                    </button>
                  {/if}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  onclick={() => handleApplyPreset(preset.id)}
                  disabled={loading}
                  class="p-2.5 rounded-lg bg-surface-recessed border border-stroke-default text-device-climate-heat-text hover:glow-climate-heat hover:power-btn-on transition-all disabled:opacity-50"
                  title="Apply to all heaters"
                >
                  <Play class="w-4 h-4" />
                </button>
                <button
                  onclick={() => toggleExpandPreset(preset.id)}
                  class="p-2.5 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong transition-colors"
                  title="Per-device settings"
                >
                  {#if expandedPreset === preset.id}
                    <ChevronUp class="w-4 h-4" />
                  {:else}
                    <ChevronDown class="w-4 h-4" />
                  {/if}
                </button>
              </div>
            </div>
          </div>

          <!-- Expanded per-device settings -->
          {#if expandedPreset === preset.id}
            <div class="border-t border-stroke-subtle bg-surface-recessed/50 p-4">
              <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">
                Per-device temperatures <span class="text-content-secondary">(override default {preset.target_temp}°C)</span>
              </p>
              {#if trvDevices.length === 0}
                <p class="text-sm text-content-tertiary">No TRV devices found</p>
              {:else}
                <div class="space-y-2">
                  {#each trvDevices as device (device.id)}
                    {@const tempInfo = getDeviceTemp(device.id, preset.target_temp)}
                    <div class="flex items-center justify-between bg-surface-elevated rounded-lg p-3 border border-stroke-subtle">
                      <span class="text-sm text-content-primary">{device.name || device.id}</span>
                      <div class="flex items-center gap-2">
                        {#if editingDeviceTemp === device.id}
                          <input
                            type="number"
                            min="5"
                            max="30"
                            step="0.5"
                            bind:value={deviceTempValue}
                            class="bg-surface-recessed border border-stroke-default rounded px-2 py-1 w-16 text-content-primary text-center text-sm font-display focus:outline-none focus:border-device-climate-heat-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onclick={() => saveDeviceTemp(preset.id, device.id)}
                            disabled={loading}
                            class="text-xs px-2 py-1 bg-success/20 text-success border border-success/30 rounded disabled:opacity-50 hover:bg-success/30 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onclick={() => editingDeviceTemp = null}
                            class="text-xs px-2 py-1 bg-surface-recessed border border-stroke-default text-content-secondary rounded hover:border-stroke-strong transition-colors"
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
                              onclick={() => resetDeviceTemp(preset.id, device.id)}
                              disabled={loading}
                              class="p-1.5 rounded bg-surface-recessed border border-stroke-subtle text-content-tertiary hover:text-content-secondary transition-colors disabled:opacity-50"
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
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <!-- Create Schedule -->
  <section>
    <div class="section-header">
      <div class="section-icon" style="background: color-mix(in srgb, var(--color-accent) 15%, transparent); border-color: color-mix(in srgb, var(--color-accent) 30%, transparent); color: var(--color-accent);">
        <Plus class="w-4 h-4" />
      </div>
      <h2 class="section-title" style="color: var(--color-accent);">Create Schedule</h2>
      <div class="section-line" style="background: linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 40%, transparent) 0%, transparent 100%);"></div>
    </div>
    <div class="card p-4">
      <div class="flex flex-col sm:flex-row flex-wrap gap-3">
        <input
          type="text"
          placeholder="Schedule name"
          bind:value={newName}
          class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 w-full sm:flex-1 sm:min-w-[150px] text-content-primary placeholder:text-content-tertiary focus:border-accent focus:outline-none transition-colors"
        />
        <div class="flex gap-3">
          <select
            bind:value={newPresetId}
            class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 text-content-primary flex-1 sm:flex-initial focus:border-accent focus:outline-none transition-colors"
          >
            {#each store.heaterPresets as preset (preset.id)}
              <option value={preset.id}>{preset.name} ({preset.target_temp}°C)</option>
            {/each}
          </select>
          <input
            type="time"
            bind:value={newTime}
            class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 text-content-primary font-display focus:border-accent focus:outline-none transition-colors"
          />
        </div>
        <button
          onclick={handleCreate}
          disabled={loading || !newName.trim()}
          class="px-5 py-2.5 rounded-lg font-semibold uppercase tracking-wider transition-all w-full sm:w-auto
                 {!loading && newName.trim() ? 'glow-accent power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-tertiary'}"
        >
          Add
        </button>
      </div>
    </div>
  </section>

  <!-- Schedules List -->
  <section>
    <div class="section-header">
      <div class="section-icon" style="background: color-mix(in srgb, var(--color-accent) 15%, transparent); border-color: color-mix(in srgb, var(--color-accent) 30%, transparent); color: var(--color-accent);">
        <Clock class="w-4 h-4" />
      </div>
      <h2 class="section-title" style="color: var(--color-accent);">Schedules</h2>
      <span class="section-count">{store.heaterSchedules.length}</span>
      <div class="section-line" style="background: linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 40%, transparent) 0%, transparent 100%);"></div>
    </div>
    {#if store.heaterSchedules.length === 0}
      <div class="card p-6 text-center">
        <Clock class="w-10 h-10 mx-auto text-content-tertiary mb-2 opacity-50" />
        <p class="text-content-tertiary">No schedules configured</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each store.heaterSchedules as schedule (schedule.id)}
          <div
            class="card p-3 flex items-center justify-between transition-opacity"
            class:opacity-50={!schedule.enabled}
            class:card-active={schedule.enabled}
            class:glow-accent={schedule.enabled}
          >
            <div class="flex items-center gap-4">
              <div class="font-display text-2xl text-accent neon-text-subtle">{schedule.time}</div>
              <div class="h-8 w-px bg-stroke-subtle"></div>
              <div>
                <span class="font-medium text-content-primary">{schedule.name}</span>
                <span class="text-sm text-content-tertiary ml-2">
                  <span class="text-device-climate-heat-text">{getPresetName(schedule.preset_id)}</span>
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                onclick={() => handleToggle(schedule.id)}
                class="px-3 py-1.5 rounded-lg font-medium text-sm transition-all
                       {schedule.enabled ? 'glow-accent power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-tertiary hover:border-stroke-strong'}"
              >
                {schedule.enabled ? 'On' : 'Off'}
              </button>
              <button
                onclick={() => handleDelete(schedule.id)}
                class="p-1.5 rounded-lg bg-error/10 text-error border border-error/30 hover:bg-error/20 transition-colors"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Pending Actions -->
  <section>
    <div class="section-header">
      <div class="section-icon" style="background: color-mix(in srgb, var(--color-warning) 15%, transparent); border-color: color-mix(in srgb, var(--color-warning) 30%, transparent); color: var(--color-warning);">
        <AlertCircle class="w-4 h-4" />
      </div>
      <h2 class="section-title" style="color: var(--color-warning);">Pending Actions</h2>
      <span class="section-count">{store.pendingHeaterActions.length}</span>
      <div class="section-line" style="background: linear-gradient(90deg, color-mix(in srgb, var(--color-warning) 40%, transparent) 0%, transparent 100%);"></div>
      {#if store.pendingHeaterActions.length > 0}
        <button
          onclick={handleClearPending}
          class="ml-3 px-3 py-1.5 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary text-sm hover:border-stroke-strong transition-colors"
        >
          Clear All
        </button>
      {/if}
    </div>
    {#if store.pendingHeaterActions.length === 0}
      <div class="card p-4 flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-success animate-glow"></div>
        <p class="text-content-secondary text-sm">All heaters online - no pending actions</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each store.pendingHeaterActions as action (action.id)}
          <div class="card p-3 flex items-center justify-between border-warning/30">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-warning animate-glow"></div>
              <span class="font-mono text-sm text-content-primary">{getDeviceName(action.device_id)}</span>
              <span class="text-content-tertiary">→</span>
              <span class="text-sm text-device-climate-heat-text">{getPresetName(action.preset_id)}</span>
            </div>
            <span class="text-xs font-display text-content-tertiary px-2 py-1 rounded bg-surface-recessed">
              Retry #{action.retry_count}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  /* Section header styles */
  .section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .section-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-content-secondary);
  }

  .section-count {
    font-family: var(--font-display);
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    background: var(--color-surface-elevated);
    color: var(--color-content-tertiary);
    border: 1px solid var(--color-stroke-subtle);
  }

  .section-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--color-stroke-subtle) 0%, transparent 100%);
  }

  /* Climate section specific */
  .section-header-climate .section-icon {
    background: color-mix(in srgb, var(--color-climate-heat-text) 15%, transparent);
    border-color: color-mix(in srgb, var(--color-climate-heat-text) 30%, transparent);
    color: var(--color-climate-heat-text);
  }
  .section-header-climate .section-title { color: var(--color-climate-heat-text); }
  .section-header-climate .section-line {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-climate-heat-text) 40%, transparent) 0%, transparent 100%);
  }

  /* Form select dark styling */
  select option {
    background: var(--color-surface-base);
    color: var(--color-content-primary);
  }

  /* Glow accent */
  .glow-accent {
    box-shadow: 0 0 15px -3px color-mix(in srgb, var(--color-accent) 40%, transparent),
                inset 0 1px 0 color-mix(in srgb, var(--color-accent) 20%, transparent);
  }
</style>
