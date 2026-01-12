<script lang="ts">
  import { store } from '$lib/stores.svelte';
  import { getPresets, applyPreset, createSchedule, deleteSchedule, toggleSchedule, clearPendingActions, updateLampPreset, createLampPreset, deleteLampPreset } from '$lib/api';
  import { Sun, Moon, Power, Lightbulb, Clock, Plus, Trash2, Play, X, Zap, AlertCircle } from 'lucide-svelte';
  import { browser } from '$app/environment';
  import type { Preset, ApplyResult } from '$lib/types';
  import type { ComponentType } from 'svelte';

  let presets = $state<Record<string, Preset>>({});
  let applyingPreset = $state<string | null>(null);
  let applyResult = $state<ApplyResult | null>(null);

  let newName = $state('');
  let newPreset = $state('night');
  let newTime = $state('19:00');
  let loading = $state(false);

  // Edit preset state
  let editingPreset = $state<string | null>(null);
  let editBrightness = $state(100);
  let editColorTemp = $state(4000);
  let editPower = $state(true);

  // New preset form state
  let showNewPresetForm = $state(false);
  let createPresetId = $state('');
  let createPresetName = $state('');
  let createPresetBrightness = $state(100);
  let createPresetColorTemp = $state(4000);
  let createPresetPower = $state(true);

  async function refreshPresets() {
    presets = await getPresets();
  }

  $effect(() => {
    if (browser) {
      refreshPresets();
    }
  });

  function getIcon(presetName: string): ComponentType {
    switch (presetName) {
      case 'day': return Sun;
      case 'night': return Moon;
      case 'off': return Power;
      default: return Lightbulb;
    }
  }

  async function handleApplyPreset(name: string) {
    applyingPreset = name;
    applyResult = null;
    try {
      applyResult = await applyPreset(name);
      store.refreshPending();
    } catch (e) {
      console.error(e);
    }
    applyingPreset = null;
  }

  function startEditPreset(name: string, preset: Preset) {
    editingPreset = name;
    editBrightness = preset.brightness;
    editColorTemp = preset.colorTemp;
    editPower = preset.power;
  }

  async function savePreset(id: string) {
    loading = true;
    try {
      await updateLampPreset(id, editBrightness, editColorTemp, editPower);
      editingPreset = null;
      await refreshPresets();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  function cancelEdit() {
    editingPreset = null;
  }

  async function handleCreatePreset() {
    if (!createPresetId.trim() || !createPresetName.trim()) return;
    loading = true;
    try {
      const id = createPresetId.trim().toLowerCase().replace(/\s+/g, '-');
      await createLampPreset(id, createPresetName.trim(), createPresetBrightness, createPresetColorTemp, createPresetPower);
      createPresetId = '';
      createPresetName = '';
      createPresetBrightness = 100;
      createPresetColorTemp = 4000;
      createPresetPower = true;
      showNewPresetForm = false;
      await refreshPresets();
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
      await deleteLampPreset(id);
      await refreshPresets();
      await store.refreshSchedules();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    loading = true;
    try {
      await createSchedule(newName.trim(), newPreset, newTime);
      newName = '';
      await store.refreshSchedules();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleDelete(id: number) {
    await deleteSchedule(id);
    await store.refreshSchedules();
  }

  async function handleToggle(id: number) {
    await toggleSchedule(id);
    await store.refreshSchedules();
  }

  async function handleClearPending() {
    await clearPendingActions();
    await store.refreshPending();
  }

  function getPresetName(presetId: string): string {
    const preset = presets[presetId];
    return preset?.name ?? presetId;
  }
</script>

<svelte:head>
  <title>Smart Home - Lighting</title>
</svelte:head>

<div class="space-y-8 pb-24">
  <!-- Presets Section -->
  <section>
    <div class="section-header section-header-lights">
      <div class="section-icon glow-lights">
        <Lightbulb class="w-4 h-4" />
      </div>
      <h2 class="section-title">Lamp Presets</h2>
      <span class="section-count">{Object.keys(presets).length}</span>
      <div class="section-line"></div>
      <button
        onclick={() => showNewPresetForm = !showNewPresetForm}
        class="ml-3 px-3 py-1.5 rounded-lg glow-lights power-btn-on text-sm font-medium flex items-center gap-1.5 transition-transform hover:scale-105"
      >
        <Plus class="w-4 h-4" />
        Add
      </button>
    </div>

    <!-- New Preset Form -->
    {#if showNewPresetForm}
      <div class="card card-active glow-lights mb-4">
        <div class="p-4 space-y-4">
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Preset ID (e.g. reading)"
              bind:value={createPresetId}
              class="flex-1 bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 text-content-primary placeholder:text-content-tertiary focus:border-device-lights-text focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Display name (e.g. Reading)"
              bind:value={createPresetName}
              class="flex-1 bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 text-content-primary placeholder:text-content-tertiary focus:border-device-lights-text focus:outline-none transition-colors"
            />
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" bind:checked={createPresetPower} class="sr-only peer" />
              <div class="w-10 h-6 rounded-full bg-surface-recessed border border-stroke-default peer-checked:glow-lights peer-checked:power-btn-on transition-all relative">
                <div class="absolute top-1 left-1 w-4 h-4 rounded-full bg-content-tertiary peer-checked:translate-x-4 peer-checked:bg-white transition-all"></div>
              </div>
              <span class="text-content-primary text-sm">Power On</span>
            </label>
            <div class="flex items-center gap-2">
              <span class="text-content-tertiary text-xs uppercase tracking-wider">Brightness</span>
              <input type="range" min="1" max="100" bind:value={createPresetBrightness} class="w-24" style="--color-accent: var(--color-lights-text);" />
              <span class="font-display text-device-lights-text w-12">{createPresetBrightness}%</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-content-tertiary text-xs uppercase tracking-wider">Color</span>
              <input type="range" min="2700" max="6500" step="100" bind:value={createPresetColorTemp} class="w-24" style="--color-accent: var(--color-lights-text);" />
              <span class="font-display text-device-lights-text w-16">{createPresetColorTemp}K</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              onclick={handleCreatePreset}
              disabled={loading || !createPresetId.trim() || !createPresetName.trim()}
              class="px-4 py-2.5 rounded-lg glow-lights power-btn-on font-semibold uppercase tracking-wider disabled:opacity-50 transition-all"
            >
              Create Preset
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
      {#each Object.entries(presets) as [name, preset] (name)}
        <div class="card group hover:border-device-lights-text/30 transition-colors">
          <div class="p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg glow-lights power-btn-on flex items-center justify-center">
                  <svelte:component this={getIcon(name)} class="w-4 h-4" />
                </div>
                <span class="font-display text-sm uppercase tracking-wider text-content-primary">{preset.name}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  onclick={() => handleApplyPreset(name)}
                  disabled={applyingPreset !== null}
                  class="p-2 rounded-lg bg-surface-recessed border border-stroke-default text-device-lights-text hover:glow-lights hover:power-btn-on transition-all disabled:opacity-50"
                  class:pulse-ring={applyingPreset === name}
                  title="Apply to all lamps"
                >
                  <Play class="w-4 h-4" />
                </button>
                <button
                  onclick={() => handleDeletePreset(name)}
                  class="p-2 rounded-lg bg-surface-recessed border border-stroke-default text-content-tertiary hover:bg-error/10 hover:text-error hover:border-error/30 transition-all"
                  title="Delete preset"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            {#if editingPreset === name}
              <div class="space-y-3 pt-2 border-t border-stroke-subtle">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" bind:checked={editPower} class="sr-only peer" />
                  <div class="w-9 h-5 rounded-full bg-surface-recessed border border-stroke-default peer-checked:glow-lights peer-checked:power-btn-on transition-all relative">
                    <div class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-content-tertiary peer-checked:translate-x-4 peer-checked:bg-white transition-all"></div>
                  </div>
                  <span class="text-sm text-content-primary">Power</span>
                </label>
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-content-tertiary">Brightness</span>
                    <span class="font-display text-sm text-device-lights-text">{editBrightness}%</span>
                  </div>
                  <input type="range" min="1" max="100" bind:value={editBrightness} class="w-full" style="--color-accent: var(--color-lights-text);" />
                </div>
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-content-tertiary">Color Temp</span>
                    <span class="font-display text-sm text-device-lights-text">{editColorTemp}K</span>
                  </div>
                  <input type="range" min="2700" max="6500" step="100" bind:value={editColorTemp} class="w-full" style="--color-accent: var(--color-lights-text);" />
                </div>
                <div class="flex gap-2 pt-1">
                  <button
                    onclick={() => savePreset(name)}
                    disabled={loading}
                    class="flex-1 py-2 rounded-lg bg-success/20 text-success border border-success/30 font-medium text-sm disabled:opacity-50 hover:bg-success/30 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onclick={cancelEdit}
                    class="px-3 py-2 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary text-sm hover:border-stroke-strong transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            {:else}
              <button
                onclick={() => startEditPreset(name, preset)}
                class="text-sm text-content-secondary hover:text-device-lights-text transition-colors flex items-center gap-2"
              >
                {#if preset.power}
                  <span class="font-display">{preset.brightness}%</span>
                  <span class="text-content-tertiary">/</span>
                  <span class="font-display">{preset.colorTemp}K</span>
                {:else}
                  <Power class="w-4 h-4 text-content-tertiary" />
                  <span>Off</span>
                {/if}
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
    {#if applyResult}
      <div class="mt-3 px-3 py-2 rounded-lg bg-surface-recessed border border-stroke-subtle inline-flex items-center gap-2">
        <Zap class="w-4 h-4 text-device-lights-text" />
        <span class="text-sm text-content-secondary">
          <span class="text-success">{applyResult.success.length} ok</span>
          {#if applyResult.pending.length > 0}
            <span class="mx-1 text-content-tertiary">/</span>
            <span class="text-warning">{applyResult.pending.length} pending</span>
          {/if}
        </span>
      </div>
    {/if}
  </section>

  <!-- Create Schedule Section -->
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
            bind:value={newPreset}
            class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 text-content-primary flex-1 sm:flex-initial focus:border-accent focus:outline-none transition-colors"
          >
            {#each Object.entries(presets) as [name, preset] (name)}
              <option value={name}>{preset.name}</option>
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
          style="--color-accent-glow: var(--color-accent-glow);"
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
      <span class="section-count">{store.schedules.length}</span>
      <div class="section-line" style="background: linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 40%, transparent) 0%, transparent 100%);"></div>
    </div>
    {#if store.schedules.length === 0}
      <div class="card p-6 text-center">
        <Clock class="w-10 h-10 mx-auto text-content-tertiary mb-2 opacity-50" />
        <p class="text-content-tertiary">No schedules configured</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {#each store.schedules as schedule (schedule.id)}
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
                  onclick={() => handleDelete(schedule.id)}
                  class="p-1.5 rounded-lg bg-surface-recessed border border-stroke-default text-content-tertiary hover:bg-error/10 hover:text-error hover:border-error/30 transition-colors"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div class="text-sm">
              <span class="font-medium text-content-primary">{schedule.name}</span>
              <span class="text-content-tertiary mx-1">→</span>
              <span class="text-device-lights-text">{getPresetName(schedule.preset)}</span>
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
      <span class="section-count">{store.pendingActions.length}</span>
      <div class="section-line" style="background: linear-gradient(90deg, color-mix(in srgb, var(--color-warning) 40%, transparent) 0%, transparent 100%);"></div>
      {#if store.pendingActions.length > 0}
        <button
          onclick={handleClearPending}
          class="ml-3 px-3 py-1.5 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary text-sm hover:border-stroke-strong transition-colors"
        >
          Clear All
        </button>
      {/if}
    </div>
    {#if store.pendingActions.length === 0}
      <div class="card p-4 flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-success animate-glow"></div>
        <p class="text-content-secondary text-sm">All lamps online - no pending actions</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each store.pendingActions as action (action.id)}
          <div class="card p-3 flex items-center justify-between border-warning/30">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-warning animate-glow"></div>
              <span class="font-mono text-sm text-content-primary">{action.device_id}</span>
              <span class="text-content-tertiary">→</span>
              <span class="text-sm text-device-lights-text">{getPresetName(action.preset)}</span>
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
  /* Section header styles - reuse from +page.svelte pattern */
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

  /* Lights section specific */
  .section-header-lights .section-icon {
    background: color-mix(in srgb, var(--color-lights-text) 15%, transparent);
    border-color: color-mix(in srgb, var(--color-lights-text) 30%, transparent);
    color: var(--color-lights-text);
  }
  .section-header-lights .section-title { color: var(--color-lights-text); }
  .section-header-lights .section-line {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-lights-text) 40%, transparent) 0%, transparent 100%);
  }

  /* Form select dark styling */
  select option {
    background: var(--color-surface-base);
    color: var(--color-content-primary);
  }

  /* Glow accent for schedules */
  .glow-accent {
    box-shadow: 0 0 15px -3px color-mix(in srgb, var(--color-accent) 40%, transparent),
                inset 0 1px 0 color-mix(in srgb, var(--color-accent) 20%, transparent);
  }
</style>
