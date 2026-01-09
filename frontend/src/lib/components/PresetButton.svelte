<script lang="ts">
  import type { Preset, ApplyResult } from '$lib/types';
  import { applyPreset } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import { Sun, Moon, Power, Lightbulb } from 'lucide-svelte';
  import type { ComponentType } from 'svelte';

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

  function getIcon(presetName: string): ComponentType {
    switch (presetName) {
      case 'day': return Sun;
      case 'night': return Moon;
      case 'off': return Power;
      default: return Lightbulb;
    }
  }
</script>

<div class="card p-4">
  <div class="flex items-center gap-3 mb-3">
    <svelte:component this={getIcon(name)} class="w-6 h-6 text-accent" />
    <div>
      <h3 class="font-medium text-content-primary">{preset.name}</h3>
      <p class="text-xs text-content-secondary">
        {preset.power ? `${preset.brightness}% / ${preset.colorTemp}K` : 'Off'}
      </p>
    </div>
  </div>

  <button
    onclick={apply}
    class="w-full py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-medium relative transition-all"
  >
    Apply to All Lamps
    {#if isPending}
      <span class="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse"></span>
    {/if}
  </button>

  {#if result}
    <p class="text-xs mt-2 text-content-secondary">
      {result.success.length} applied, {result.pending.length} pending
    </p>
  {/if}
</div>
