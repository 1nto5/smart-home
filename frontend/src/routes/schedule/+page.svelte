<script lang="ts">
  import { store } from '$lib/stores.svelte';
  import { createSchedule, deleteSchedule, toggleSchedule, clearPendingActions } from '$lib/api';

  let newName = $state('');
  let newPreset = $state('night');
  let newTime = $state('19:00');
  let loading = $state(false);

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
</script>

<svelte:head>
  <title>Smart Home - Schedule</title>
</svelte:head>

<div class="space-y-8">
  <!-- Create Schedule -->
  <section class="bg-surface-elevated border border-stroke-default rounded-xl p-4">
    <h2 class="text-lg font-medium text-content-primary mb-4">Create Schedule</h2>
    <div class="flex flex-col sm:flex-row flex-wrap gap-3">
      <input
        type="text"
        placeholder="Schedule name"
        bind:value={newName}
        class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2 w-full sm:flex-1 sm:min-w-[150px] text-content-primary placeholder:text-content-tertiary"
      />
      <div class="flex gap-3">
        <select
          bind:value={newPreset}
          class="bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2 text-content-primary flex-1 sm:flex-initial"
        >
          <option value="day">Day Mode</option>
          <option value="night">Night Mode</option>
          <option value="off">All Off</option>
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
    <h2 class="text-lg font-medium text-content-primary mb-4">Schedules ({store.schedules.length})</h2>
    {#if store.schedules.length === 0}
      <p class="text-content-secondary">No schedules yet</p>
    {:else}
      <div class="space-y-2">
        {#each store.schedules as schedule (schedule.id)}
          <div
            class="bg-surface-elevated border border-stroke-default rounded-xl p-3 flex items-center justify-between"
            class:opacity-50={!schedule.enabled}
          >
            <div class="flex items-center gap-4">
              <span class="text-xl font-mono text-content-primary">{schedule.time}</span>
              <div>
                <span class="font-medium text-content-primary">{schedule.name}</span>
                <span class="text-sm text-content-secondary ml-2">({schedule.preset})</span>
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
                Delete
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
      <h2 class="text-lg font-medium text-content-primary">Pending Actions ({store.pendingActions.length})</h2>
      {#if store.pendingActions.length > 0}
        <button
          onclick={handleClearPending}
          class="text-sm px-3 py-1 rounded-lg bg-surface-recessed text-content-secondary hover:bg-stroke-default transition-colors"
        >
          Clear All
        </button>
      {/if}
    </div>
    {#if store.pendingActions.length === 0}
      <p class="text-content-secondary">No pending actions (all lamps online)</p>
    {:else}
      <div class="space-y-2">
        {#each store.pendingActions as action (action.id)}
          <div class="bg-surface-elevated border border-stroke-default rounded-xl p-3 flex items-center justify-between">
            <div>
              <span class="font-mono text-sm text-content-primary">{action.device_id}</span>
              <span class="text-sm text-content-secondary ml-2">→ {action.preset}</span>
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
