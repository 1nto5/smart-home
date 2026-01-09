<script lang="ts">
  import { store } from '$lib/stores.svelte';
  import { createHeaterSchedule, deleteHeaterSchedule, toggleHeaterSchedule, clearPendingHeaterActions, updateHeaterPreset, applyHeaterPreset } from '$lib/api';
  import { Thermometer, Clock, Trash2, Plus, Play } from 'lucide-svelte';
  import type { HeaterPreset } from '$lib/types';

  let newName = $state('');
  let newPresetId = $state('night');
  let newTime = $state('22:00');
  let loading = $state(false);
  let editingPreset = $state<string | null>(null);
  let editTemp = $state(21);

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
</script>

<svelte:head>
  <title>Smart Home - Heater Schedule</title>
</svelte:head>

<div class="space-y-8">
  <!-- Presets -->
  <section>
    <h2 class="text-lg font-medium text-content-primary mb-4 flex items-center gap-2">
      <Thermometer class="w-5 h-5" />
      Heater Presets
    </h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {#each store.heaterPresets as preset (preset.id)}
        <div class="bg-surface-elevated border border-stroke-default rounded-xl p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-content-primary">{preset.name}</span>
            <button
              onclick={() => handleApplyPreset(preset.id)}
              disabled={loading}
              class="p-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors disabled:opacity-50"
              title="Apply to all heaters"
            >
              <Play class="w-4 h-4" />
            </button>
          </div>
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
              <span class="font-mono text-sm text-content-primary">{action.device_id}</span>
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
