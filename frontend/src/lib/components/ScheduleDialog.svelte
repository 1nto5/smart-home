<script lang="ts">
  import type { HeaterSchedule, HeaterPreset } from '$lib/types';
  import { updateHeaterSchedule, deleteHeaterSchedule } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Trash2, Save } from 'lucide-svelte';

  let {
    schedule,
    presets,
    open = $bindable(false),
    onclose
  }: {
    schedule: HeaterSchedule;
    presets: HeaterPreset[];
    open: boolean;
    onclose: () => void;
  } = $props();

  let loading = $state(false);

  // Form state
  let editName = $state(schedule.name);
  let editPresetId = $state(schedule.preset_id);
  let editTime = $state(schedule.time);

  // Reset form when dialog opens
  $effect(() => {
    if (open && schedule) {
      editName = schedule.name;
      editPresetId = schedule.preset_id;
      editTime = schedule.time;
    }
  });

  async function handleSave() {
    if (!editName.trim()) return;
    loading = true;
    try {
      await updateHeaterSchedule(schedule.id, {
        name: editName.trim(),
        preset_id: editPresetId,
        time: editTime,
      });
      await store.refreshHeaterSchedules();
      onclose();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleDelete() {
    if (!confirm(`Delete schedule "${schedule.name}"?`)) return;
    loading = true;
    try {
      await deleteHeaterSchedule(schedule.id);
      await store.refreshHeaterSchedules();
      onclose();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  function getPresetName(presetId: string): string {
    const preset = presets.find(p => p.id === presetId);
    return preset?.name ?? presetId;
  }
</script>

<DeviceDialog {open} {onclose} title="Edit Schedule">
  <div class="space-y-5">
    <!-- Schedule Name -->
    <div>
      <label class="text-xs text-content-tertiary uppercase tracking-wider mb-2 block">Name</label>
      <input
        type="text"
        bind:value={editName}
        class="w-full bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 text-content-primary placeholder:text-content-tertiary focus:border-accent focus:outline-none transition-colors"
        placeholder="Schedule name"
      />
    </div>

    <!-- Time -->
    <div>
      <label class="text-xs text-content-tertiary uppercase tracking-wider mb-2 block">Time</label>
      <input
        type="time"
        bind:value={editTime}
        class="w-full bg-surface-recessed border border-stroke-default rounded-lg px-3 py-2.5 text-content-primary font-display text-xl focus:border-accent focus:outline-none transition-colors"
      />
    </div>

    <!-- Preset Selection -->
    <div>
      <label class="text-xs text-content-tertiary uppercase tracking-wider mb-2 block">Preset</label>
      <div class="grid grid-cols-2 gap-2">
        {#each presets as preset (preset.id)}
          <button
            onclick={() => editPresetId = preset.id}
            class="py-3 px-4 rounded-lg transition-all font-medium text-left
                   {editPresetId === preset.id ? 'glow-climate-heat power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
          >
            <span class="block text-sm">{preset.name}</span>
            <span class="block text-xs opacity-70">{preset.target_temp}°C</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-4 border-t border-stroke-subtle flex gap-3">
      <button
        onclick={handleSave}
        disabled={loading || !editName.trim()}
        class="flex-1 py-3 rounded-lg glow-accent power-btn-on font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50 transition-all"
      >
        <Save class="w-4 h-4" />
        Save
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
