<script lang="ts">
  import { store } from '$lib/stores.svelte';
  import { createHeaterSchedule, deleteHeaterSchedule, toggleHeaterSchedule, clearPendingHeaterActions, updateHeaterPreset, applyHeaterPreset, setHeaterOverride, createHeaterPreset, deleteHeaterPreset, getTuyaDevices, getPresetDeviceTemps, setPresetDeviceTemp, deletePresetDeviceTemp } from '$lib/api';
  import { Thermometer, Clock, Trash2, Plus, Play, PauseCircle, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-svelte';
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

<div class="space-y-8">
  <!-- Override Mode -->
  <section class="bg-surface-elevated border rounded-xl p-4 {store.heaterOverride?.enabled ? 'border-warning' : 'border-stroke-default'}">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-medium text-content-primary flex items-center gap-2">
        <PauseCircle class="w-5 h-5" />
        Override Mode
      </h2>
      <button
        onclick={handleOverrideToggle}
        disabled={loading}
        class="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50
               {store.heaterOverride?.enabled
                 ? 'bg-warning text-white hover:bg-warning/80'
                 : 'bg-surface-recessed text-content-secondary hover:bg-stroke-default'}"
      >
        {store.heaterOverride?.enabled ? 'Active' : 'Off'}
      </button>
    </div>

    {#if store.heaterOverride?.enabled}
      <div class="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
        <p class="text-sm text-warning">Schedules are paused while override is active</p>
      </div>
    {/if}

    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="overrideMode"
            value="pause"
            checked={selectedOverrideMode === 'pause'}
            onchange={() => { selectedOverrideMode = 'pause'; handleOverrideUpdate('pause'); }}
            class="accent-accent"
          />
          <span class="text-content-primary">Pause schedules</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="overrideMode"
            value="fixed"
            checked={selectedOverrideMode === 'fixed'}
            onchange={() => { selectedOverrideMode = 'fixed'; handleOverrideUpdate('fixed'); }}
            class="accent-accent"
          />
          <span class="text-content-primary">Fixed temperature</span>
        </label>
      </div>

      {#if selectedOverrideMode === 'fixed'}
        <div class="flex items-center gap-2">
          <input
            type="range"
            min="5"
            max="25"
            step="0.5"
            bind:value={overrideTemp}
            onchange={() => handleOverrideUpdate()}
            class="w-32 accent-accent"
          />
          <span class="text-xl font-mono text-content-primary w-16">{overrideTemp}°C</span>
        </div>
      {/if}
    </div>
  </section>

  <!-- Presets -->
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-medium text-content-primary flex items-center gap-2">
        <Thermometer class="w-5 h-5" />
        Heater Presets
      </h2>
      <button
        onclick={() => showNewPresetForm = !showNewPresetForm}
        class="text-sm px-3 py-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors flex items-center gap-1"
      >
        <Plus class="w-4 h-4" />
        Add Preset
      </button>
    </div>

    {#if showNewPresetForm}
      <div class="bg-surface-elevated border border-stroke-default rounded-xl p-4 mb-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Preset ID (e.g. away)"
            bind:value={createPresetIdVal}
            class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2 text-content-primary placeholder:text-content-tertiary flex-1"
          />
          <input
            type="text"
            placeholder="Display name (e.g. Away)"
            bind:value={createPresetName}
            class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2 text-content-primary placeholder:text-content-tertiary flex-1"
          />
          <div class="flex items-center gap-2">
            <input
              type="number"
              min="5"
              max="30"
              step="0.5"
              bind:value={createPresetTemp}
              class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2 w-20 text-content-primary text-center"
            />
            <span class="text-content-secondary">°C</span>
          </div>
          <button
            onclick={handleCreatePreset}
            disabled={loading || !createPresetIdVal.trim() || !createPresetName.trim()}
            class="bg-accent hover:bg-accent/80 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium"
          >
            Create
          </button>
          <button
            onclick={() => showNewPresetForm = false}
            class="px-3 py-2 rounded-lg bg-surface-recessed text-content-secondary hover:bg-stroke-default transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>
    {/if}

    <div class="space-y-3">
      {#each store.heaterPresets as preset (preset.id)}
        <div class="bg-surface-elevated border border-stroke-default rounded-xl overflow-hidden">
          <div class="p-4 relative group">
            <button
              onclick={() => handleDeletePreset(preset.id)}
              class="absolute top-2 right-2 p-1 rounded bg-error/20 text-error opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete preset"
            >
              <X class="w-3 h-3" />
            </button>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <span class="font-medium text-content-primary">{preset.name}</span>
                {#if editingPreset === preset.id}
                  <div class="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="30"
                      step="0.5"
                      bind:value={editTemp}
                      class="bg-surface-recessed border border-stroke-default rounded px-2 py-1 w-16 text-content-primary text-center"
                    />
                    <span class="text-content-secondary">°C</span>
                    <button
                      onclick={() => savePreset(preset.id)}
                      class="text-xs px-2 py-1 bg-success/20 text-success rounded"
                    >
                      Save
                    </button>
                    <button
                      onclick={cancelEdit}
                      class="text-xs px-2 py-1 bg-surface-recessed text-content-secondary rounded"
                    >
                      Cancel
                    </button>
                  </div>
                {:else}
                  <button
                    onclick={() => startEditPreset(preset)}
                    class="text-2xl font-mono text-content-primary hover:text-accent transition-colors"
                  >
                    {preset.target_temp}°C
                  </button>
                {/if}
              </div>
              <div class="flex items-center gap-2">
                <button
                  onclick={() => handleApplyPreset(preset.id)}
                  disabled={loading}
                  class="p-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors disabled:opacity-50"
                  title="Apply to all heaters"
                >
                  <Play class="w-4 h-4" />
                </button>
                <button
                  onclick={() => toggleExpandPreset(preset.id)}
                  class="p-1.5 rounded-lg bg-surface-recessed text-content-secondary hover:bg-stroke-default transition-colors"
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

          {#if expandedPreset === preset.id}
            <div class="border-t border-stroke-default bg-surface-recessed/50 p-4">
              <p class="text-sm text-content-secondary mb-3">Per-device temperatures (override default {preset.target_temp}°C)</p>
              {#if trvDevices.length === 0}
                <p class="text-sm text-content-tertiary">No TRV devices found</p>
              {:else}
                <div class="space-y-2">
                  {#each trvDevices as device (device.id)}
                    {@const tempInfo = getDeviceTemp(device.id, preset.target_temp)}
                    <div class="flex items-center justify-between bg-surface-elevated rounded-lg p-2">
                      <span class="text-sm text-content-primary">{device.name || device.id}</span>
                      <div class="flex items-center gap-2">
                        {#if editingDeviceTemp === device.id}
                          <input
                            type="number"
                            min="5"
                            max="30"
                            step="0.5"
                            bind:value={deviceTempValue}
                            class="bg-surface-recessed border border-stroke-default rounded px-2 py-1 w-16 text-content-primary text-center text-sm"
                          />
                          <button
                            onclick={() => saveDeviceTemp(preset.id, device.id)}
                            disabled={loading}
                            class="text-xs px-2 py-1 bg-success/20 text-success rounded disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onclick={() => editingDeviceTemp = null}
                            class="text-xs px-2 py-1 bg-surface-recessed text-content-secondary rounded"
                          >
                            Cancel
                          </button>
                        {:else}
                          <button
                            onclick={() => startEditDeviceTemp(device.id, tempInfo.temp)}
                            class="font-mono text-sm {tempInfo.isCustom ? 'text-accent' : 'text-content-secondary'} hover:text-accent transition-colors"
                          >
                            {tempInfo.temp}°C {tempInfo.isCustom ? '' : '(default)'}
                          </button>
                          {#if tempInfo.isCustom}
                            <button
                              onclick={() => resetDeviceTemp(preset.id, device.id)}
                              disabled={loading}
                              class="p-1 rounded bg-surface-recessed text-content-tertiary hover:text-content-secondary transition-colors disabled:opacity-50"
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
  <section class="bg-surface-elevated border border-stroke-default rounded-xl p-4">
    <h2 class="text-lg font-medium text-content-primary mb-4 flex items-center gap-2">
      <Plus class="w-5 h-5" />
      Create Schedule
    </h2>
    <div class="flex flex-col sm:flex-row flex-wrap gap-3">
      <input
        type="text"
        placeholder="Schedule name"
        bind:value={newName}
        class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2 w-full sm:flex-1 sm:min-w-[150px] text-content-primary placeholder:text-content-tertiary"
      />
      <div class="flex gap-3">
        <select
          bind:value={newPresetId}
          class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2 text-content-primary flex-1 sm:flex-initial"
        >
          {#each store.heaterPresets as preset (preset.id)}
            <option value={preset.id}>{preset.name} ({preset.target_temp}°C)</option>
          {/each}
        </select>
        <input
          type="time"
          bind:value={newTime}
          class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2 text-content-primary"
        />
      </div>
      <button
        onclick={handleCreate}
        disabled={loading || !newName.trim()}
        class="bg-accent hover:bg-accent/80 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium w-full sm:w-auto"
      >
        Add
      </button>
    </div>
  </section>

  <!-- Schedules List -->
  <section>
    <h2 class="text-lg font-medium text-content-primary mb-4 flex items-center gap-2">
      <Clock class="w-5 h-5" />
      Schedules ({store.heaterSchedules.length})
    </h2>
    {#if store.heaterSchedules.length === 0}
      <p class="text-content-secondary">No heater schedules yet</p>
    {:else}
      <div class="space-y-2">
        {#each store.heaterSchedules as schedule (schedule.id)}
          <div
            class="bg-surface-elevated border border-stroke-default rounded-xl p-3 flex items-center justify-between"
            class:opacity-50={!schedule.enabled}
          >
            <div class="flex items-center gap-4">
              <span class="text-xl font-mono text-content-primary">{schedule.time}</span>
              <div>
                <span class="font-medium text-content-primary">{schedule.name}</span>
                <span class="text-sm text-content-secondary ml-2">({getPresetName(schedule.preset_id)})</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                onclick={() => handleToggle(schedule.id)}
                class="text-sm px-3 py-1 rounded-lg font-medium transition-colors
                       {schedule.enabled ? 'bg-success/20 text-success' : 'bg-surface-recessed text-content-secondary'}"
              >
                {schedule.enabled ? 'On' : 'Off'}
              </button>
              <button
                onclick={() => handleDelete(schedule.id)}
                class="text-sm px-3 py-1 rounded-lg bg-error/20 text-error hover:bg-error/30 font-medium transition-colors"
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
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-medium text-content-primary">Pending Actions ({store.pendingHeaterActions.length})</h2>
      {#if store.pendingHeaterActions.length > 0}
        <button
          onclick={handleClearPending}
          class="text-sm px-3 py-1 rounded-lg bg-surface-recessed text-content-secondary hover:bg-stroke-default transition-colors"
        >
          Clear All
        </button>
      {/if}
    </div>
    {#if store.pendingHeaterActions.length === 0}
      <p class="text-content-secondary">No pending actions (all heaters online)</p>
    {:else}
      <div class="space-y-2">
        {#each store.pendingHeaterActions as action (action.id)}
          <div class="bg-surface-elevated border border-stroke-default rounded-xl p-3 flex items-center justify-between">
            <div>
              <span class="font-mono text-sm text-content-primary">{getDeviceName(action.device_id)}</span>
              <span class="text-sm text-content-secondary ml-2">→ {getPresetName(action.preset_id)}</span>
            </div>
            <span class="text-xs text-content-tertiary">
              Retry #{action.retry_count}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>
