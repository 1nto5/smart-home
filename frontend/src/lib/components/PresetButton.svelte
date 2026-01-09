<script lang="ts">
  import type { Preset, ApplyResult } from '$lib/types';
  import { applyPreset } from '$lib/api';
  import { store } from '$lib/stores.svelte';

  let { name, preset }: { name: string; preset: Preset } = $props();
  let isPending = $state(false);
  let result = $state<ApplyResult | null>(null);

  async function apply() {
    isPending = true;
    result = null;
    try {
      result = await applyPreset(name);
      store.refreshPending();
    } catch (e) {
      console.error(e);
    }
    isPending = false;
  }

  function icon(presetName: string): string {
    switch (presetName) {
      case 'day': return '\u2600\uFE0F'; // sun
      case 'night': return '\uD83C\uDF19'; // moon
      case 'off': return '\u26A1'; // power
      default: return '\uD83D\uDCA1'; // bulb
    }
  }
</script>

<div class="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
  <div class="flex items-center gap-3 mb-3">
    <span class="text-2xl">{icon(name)}</span>
    <div>
      <h3 class="font-medium">{preset.name}</h3>
      <p class="text-xs text-[var(--muted)]">
        {preset.power ? `${preset.brightness}% / ${preset.colorTemp}K` : 'Off'}
      </p>
    </div>
  </div>

  <button
    onclick={apply}
    class="w-full py-2 rounded bg-[var(--accent)] hover:bg-blue-600 relative transition-all"
  >
    Apply to All Lamps
    {#if isPending}
      <span class="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse"></span>
    {/if}
  </button>

  {#if result}
    <p class="text-xs mt-2 text-[var(--muted)]">
      {result.success.length} applied, {result.pending.length} pending
    </p>
  {/if}
</div>
