<script lang="ts">
  import { store } from '$lib/stores.svelte';
  import { createHeaterSchedule, deleteHeaterSchedule, toggleHeaterSchedule, clearPendingHeaterActions, applyHeaterPreset, createHeaterPreset, deleteHeaterPreset, getTuyaDevices } from '$lib/api';
  import { Thermometer, Clock, Trash2, Plus, Play, X, AlertCircle, Flame, Pencil, PowerOff } from 'lucide-svelte';
  import { showApplyResult, notify } from '$lib/toast.svelte';
  import type { HeaterPreset, HeaterSchedule, TuyaDevice } from '$lib/types';
  import { browser } from '$app/environment';
  import PresetDialog from '$lib/components/PresetDialog.svelte';
  import ScheduleDialog from '$lib/components/ScheduleDialog.svelte';

  let newName = $state('');
  let newPresetId = $state('night');
  let newTime = $state('22:00');
  // Per-action pending states
  let creatingPreset = $state(false);
  let creatingSchedule = $state(false);
  let deletingPresetId = $state<string | null>(null);
  let loading = $derived(creatingPreset || creatingSchedule || deletingPresetId !== null);
  let applyingPresetId = $state<string | null>(null);

  // TRV devices for dialog
  let trvDevices = $state<TuyaDevice[]>([]);

  // Preset dialog state
  let selectedPreset = $state<HeaterPreset | null>(null);
  let presetDialogOpen = $state(false);

  // Schedule dialog state
  let selectedSchedule = $state<HeaterSchedule | null>(null);
  let scheduleDialogOpen = $state(false);

  // Load TRV devices on mount
  $effect(() => {
    if (browser) {
      getTuyaDevices().then(devices => {
        trvDevices = devices.filter(d => d.category === 'wkf');
      });
    }
  });

  function openPresetDialog(preset: HeaterPreset) {
    selectedPreset = preset;
    presetDialogOpen = true;
  }

  function closePresetDialog() {
    presetDialogOpen = false;
    selectedPreset = null;
  }

  function openScheduleDialog(schedule: HeaterSchedule) {
    selectedSchedule = schedule;
    scheduleDialogOpen = true;
  }

  function closeScheduleDialog() {
    scheduleDialogOpen = false;
    selectedSchedule = null;
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    creatingSchedule = true;
    try {
      await createHeaterSchedule(newName.trim(), newPresetId, newTime);
      newName = '';
      await store.refreshHeaterSchedules();
    } catch (e) {
      console.error(e);
    }
    creatingSchedule = false;
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

  // New preset state
  let showNewPresetForm = $state(false);
  let createPresetIdVal = $state('');
  let createPresetName = $state('');
  let createPresetTemp = $state(20);

  async function handleCreatePreset() {
    if (!createPresetIdVal.trim() || !createPresetName.trim()) return;
    creatingPreset = true;
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
    creatingPreset = false;
  }

  async function handleDeletePreset(id: string) {
    if (!confirm(`Delete preset "${id}"? This will also delete any schedules using this preset.`)) return;
    deletingPresetId = id;
    try {
      await deleteHeaterPreset(id);
      await store.refreshHeaterPresets();
      await store.refreshHeaterSchedules();
    } catch (e) {
      console.error(e);
    }
    deletingPresetId = null;
  }

  async function handleApplyPreset(id: string) {
    applyingPresetId = id;
    try {
      const result = await applyHeaterPreset(id);
      showApplyResult(result, getPresetName(id));
      await store.refreshPendingHeater();
    } catch (e: any) {
      console.error(e);
      notify.error(`Failed: ${getPresetName(id)}`);
    }
    applyingPresetId = null;
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
              class="relative px-4 py-2.5 rounded-lg glow-climate-heat power-btn-on font-semibold uppercase tracking-wider disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Plus class="w-4 h-4 {creatingPreset ? 'animate-spin' : ''}" />
              Create
              {#if creatingPreset}
                <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
              {/if}
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

    <!-- Preset Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {#each store.heaterPresets as preset (preset.id)}
        {@const isOffPreset = preset.id === 'off'}
        <div class="card p-4 hover:border-device-climate-heat-text/30 transition-colors {isOffPreset ? 'opacity-75' : ''}">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg {isOffPreset ? 'bg-surface-recessed border border-stroke-subtle' : 'glow-climate-heat power-btn-on'} flex items-center justify-center">
                {#if isOffPreset}
                  <PowerOff class="w-4 h-4 text-content-tertiary" />
                {:else}
                  <Flame class="w-4 h-4" />
                {/if}
              </div>
              <span class="font-display text-sm uppercase tracking-wider text-content-primary">{preset.name}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                onclick={() => handleApplyPreset(preset.id)}
                disabled={applyingPresetId !== null}
                class="p-2 rounded-lg bg-surface-recessed border border-stroke-default {isOffPreset ? 'text-content-secondary hover:text-content-primary' : 'text-device-climate-heat-text hover:glow-climate-heat hover:power-btn-on'} transition-all disabled:opacity-50 relative"
                title="Apply to all heaters"
              >
                <Play class="w-4 h-4 {applyingPresetId === preset.id ? 'animate-spin' : ''}" />
                {#if applyingPresetId === preset.id}
                  <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
                {/if}
              </button>
              {#if !isOffPreset}
                <button
                  onclick={() => openPresetDialog(preset)}
                  class="p-2 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:text-device-climate-heat-text hover:border-device-climate-heat-text/30 transition-all"
                  title="Edit preset"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  onclick={() => handleDeletePreset(preset.id)}
                  disabled={deletingPresetId !== null}
                  class="relative p-2 rounded-lg bg-surface-recessed border border-stroke-default text-content-tertiary hover:bg-error/10 hover:text-error hover:border-error/30 transition-all disabled:opacity-50"
                  title="Delete preset"
                >
                  <Trash2 class="w-4 h-4 {deletingPresetId === preset.id ? 'animate-spin' : ''}" />
                  {#if deletingPresetId === preset.id}
                    <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
                  {/if}
                </button>
              {/if}
            </div>
          </div>
          {#if isOffPreset}
            <span class="font-display text-2xl text-content-tertiary">
              Power Off
            </span>
          {:else}
            <span class="font-display text-2xl text-device-climate-heat-text neon-text-subtle">
              {preset.target_temp}°C
            </span>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Preset Dialog -->
    {#if selectedPreset}
      <PresetDialog
        preset={selectedPreset}
        {trvDevices}
        bind:open={presetDialogOpen}
        onclose={closePresetDialog}
      />
    {/if}
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
          class="relative px-5 py-2.5 rounded-lg font-semibold uppercase tracking-wider transition-all w-full sm:w-auto flex items-center justify-center gap-2
                 {!loading && newName.trim() ? 'glow-accent power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-tertiary'}"
        >
          <Plus class="w-4 h-4 {creatingSchedule ? 'animate-spin' : ''}" />
          Add
          {#if creatingSchedule}
            <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
          {/if}
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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {#each store.heaterSchedules as schedule (schedule.id)}
          <div
            class="card p-3 transition-opacity"
            class:opacity-50={!schedule.enabled}
            class:card-active={schedule.enabled}
            class:glow-accent={schedule.enabled}
          >
            <div class="flex items-center justify-between mb-2">
              <div class="font-display text-xl text-accent neon-text-subtle">{schedule.time}</div>
              <div class="flex gap-1.5">
                <button
                  onclick={() => handleToggle(schedule.id)}
                  class="px-2.5 py-1 rounded-lg font-medium text-xs transition-all
                         {schedule.enabled ? 'glow-accent power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-tertiary hover:border-stroke-strong'}"
                >
                  {schedule.enabled ? 'On' : 'Off'}
                </button>
                <button
                  onclick={() => openScheduleDialog(schedule)}
                  class="p-1.5 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:text-accent hover:border-accent/30 transition-colors"
                  title="Edit schedule"
                >
                  <Pencil class="w-3.5 h-3.5" />
                </button>
                <button
                  onclick={() => handleDelete(schedule.id)}
                  class="p-1.5 rounded-lg bg-surface-recessed border border-stroke-default text-content-tertiary hover:bg-error/10 hover:text-error hover:border-error/30 transition-colors"
                  title="Delete schedule"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div class="text-sm">
              <span class="font-medium text-content-primary">{schedule.name}</span>
              <span class="text-content-tertiary mx-1">→</span>
              <span class="text-device-climate-heat-text">{getPresetName(schedule.preset_id)}</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Schedule Dialog -->
    {#if selectedSchedule}
      <ScheduleDialog
        schedule={selectedSchedule}
        presets={store.heaterPresets}
        bind:open={scheduleDialogOpen}
        onclose={closeScheduleDialog}
      />
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
