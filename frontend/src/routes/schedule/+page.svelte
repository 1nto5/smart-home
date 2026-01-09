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
  <section class="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
    <h2 class="text-lg font-medium mb-4">Create Schedule</h2>
    <div class="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Schedule name"
        bind:value={newName}
        class="bg-zinc-800 border border-[var(--border)] rounded px-3 py-2 flex-1 min-w-[150px]"
      />
      <select
        bind:value={newPreset}
        class="bg-zinc-800 border border-[var(--border)] rounded px-3 py-2"
      >
        <option value="day">Day Mode</option>
        <option value="night">Night Mode</option>
        <option value="off">All Off</option>
      </select>
      <input
        type="time"
        bind:value={newTime}
        class="bg-zinc-800 border border-[var(--border)] rounded px-3 py-2"
      />
      <button
        onclick={handleCreate}
        disabled={loading || !newName.trim()}
        class="bg-[var(--accent)] hover:bg-blue-600 disabled:opacity-50 px-4 py-2 rounded"
      >
        Add
      </button>
    </div>
  </section>

  <!-- Schedules List -->
  <section>
    <h2 class="text-lg font-medium mb-4">Schedules ({store.schedules.length})</h2>
    {#if store.schedules.length === 0}
      <p class="text-[var(--muted)]">No schedules yet</p>
    {:else}
      <div class="space-y-2">
        {#each store.schedules as schedule (schedule.id)}
          <div
            class="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 flex items-center justify-between"
            class:opacity-50={!schedule.enabled}
          >
            <div class="flex items-center gap-4">
              <span class="text-xl font-mono">{schedule.time}</span>
              <div>
                <span class="font-medium">{schedule.name}</span>
                <span class="text-sm text-[var(--muted)] ml-2">({schedule.preset})</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                onclick={() => handleToggle(schedule.id)}
                class="text-sm px-3 py-1 rounded"
                class:bg-green-800={schedule.enabled}
                class:bg-zinc-700={!schedule.enabled}
              >
                {schedule.enabled ? 'On' : 'Off'}
              </button>
              <button
                onclick={() => handleDelete(schedule.id)}
                class="text-sm px-3 py-1 rounded bg-red-900 hover:bg-red-800"
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
      <h2 class="text-lg font-medium">Pending Actions ({store.pendingActions.length})</h2>
      {#if store.pendingActions.length > 0}
        <button
          onclick={handleClearPending}
          class="text-sm px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600"
        >
          Clear All
        </button>
      {/if}
    </div>
    {#if store.pendingActions.length === 0}
      <p class="text-[var(--muted)]">No pending actions (all lamps online)</p>
    {:else}
      <div class="space-y-2">
        {#each store.pendingActions as action (action.id)}
          <div class="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 flex items-center justify-between">
            <div>
              <span class="font-mono text-sm">{action.device_id}</span>
              <span class="text-sm text-[var(--muted)] ml-2">→ {action.preset}</span>
            </div>
            <span class="text-xs text-[var(--muted)]">
              Retry #{action.retry_count}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>
