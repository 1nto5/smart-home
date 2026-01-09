<script lang="ts">
  import PresetButton from '$lib/components/PresetButton.svelte';
  import { getPresets } from '$lib/api';
  import { browser } from '$app/environment';
  import type { Preset } from '$lib/types';

  let presets = $state<Record<string, Preset>>({});

  $effect(() => {
    if (browser) {
      getPresets().then(p => presets = p);
    }
  });
</script>

<svelte:head>
  <title>Smart Home - Presets</title>
</svelte:head>

<div class="space-y-6">
  <h2 class="text-lg font-medium">Lamp Presets</h2>
  <p class="text-sm text-[var(--muted)]">Apply a preset to all lamps at once</p>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each Object.entries(presets) as [name, preset] (name)}
      <PresetButton {name} {preset} />
    {/each}
  </div>
</div>
