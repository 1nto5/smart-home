<script lang="ts">
  import type { Preset } from '$lib/types';
  import { applyPreset, getPresets, controlLamp, getLamps, applyHeaterPreset } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import { Power, Sun, Sunrise, Sunset, Moon, Lightbulb, Flame, Snowflake, Sofa, Target, Clapperboard, MoreHorizontal, X, Thermometer } from 'lucide-svelte';
  import type { ComponentType } from 'svelte';

  let presets = $state<Record<string, Preset>>({});
  let pendingActions = $state<Set<string>>(new Set());
  let expanded = $state(false);
  let heaterExpanded = $state(false);

  $effect(() => {
    getPresets().then(p => presets = p).catch(() => {});
  });

  async function handlePreset(name: string) {
    pendingActions = new Set([...pendingActions, name]);
    try {
      await applyPreset(name);
      store.refreshLamps();
    } catch (e) {
      console.error(e);
    }
    const newSet = new Set(pendingActions);
    newSet.delete(name);
    pendingActions = newSet;
    expanded = false;
  }

  async function handleHeaterPreset(id: string) {
    pendingActions = new Set([...pendingActions, `heater_${id}`]);
    try {
      await applyHeaterPreset(id);
      await store.refreshPendingHeater();
    } catch (e) {
      console.error(e);
    }
    const newSet = new Set(pendingActions);
    newSet.delete(`heater_${id}`);
    pendingActions = newSet;
    heaterExpanded = false;
  }

  async function allLightsOff() {
    pendingActions = new Set([...pendingActions, 'off']);
    try {
      const lamps = store.lamps.filter(l => l.category === 'lamp');
      await Promise.all(lamps.map(l => controlLamp(l.id, { power: false })));
      store.refreshLamps();
    } catch (e) {
      console.error(e);
    }
    const newSet = new Set(pendingActions);
    newSet.delete('off');
    pendingActions = newSet;
  }

  const presetIcons: Record<string, ComponentType> = {
    day: Sun,
    morning: Sunrise,
    evening: Sunset,
    night: Moon,
    off: Power,
    bright: Lightbulb,
    dim: Lightbulb,
    warm: Flame,
    cool: Snowflake,
    relax: Sofa,
    focus: Target,
    movie: Clapperboard,
  };

  function getIcon(name: string): ComponentType {
    return presetIcons[name.toLowerCase()] || Lightbulb;
  }
</script>

<div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
  <!-- Heater expanded panel -->
  {#if heaterExpanded && store.heaterPresets.length > 0}
    <div class="quick-bar rounded-2xl px-3 py-3 mb-2 animate-fade-in">
      <div class="grid grid-cols-2 gap-2 w-full max-w-[220px]">
        {#each store.heaterPresets as preset (preset.id)}
          <button
            onclick={() => handleHeaterPreset(preset.id)}
            class="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all
                   hover:bg-surface-recessed active:scale-95"
          >
            <span class="{pendingActions.has(`heater_${preset.id}`) ? 'animate-pulse' : ''}">
              <Thermometer class="w-5 h-5" />
            </span>
            <span class="text-xs text-content-secondary">{preset.name}</span>
            <span class="text-[10px] text-content-tertiary">{preset.target_temp}°C</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Lamp expanded panel -->
  {#if expanded && Object.keys(presets).length > 0}
    <div class="quick-bar rounded-2xl px-3 py-3 mb-2 animate-fade-in">
      <div class="grid grid-cols-3 gap-2 w-full max-w-[280px]">
        {#each Object.entries(presets) as [name, preset] (name)}
          <button
            onclick={() => handlePreset(name)}
            class="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all
                   hover:bg-surface-recessed active:scale-95"
          >
            <span class="{pendingActions.has(name) ? 'animate-pulse' : ''}">
              <svelte:component this={getIcon(name)} class="w-5 h-5" />
            </span>
            <span class="text-xs text-content-secondary capitalize">{preset.name || name}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Main bar -->
  <div class="quick-bar rounded-2xl px-2 py-2 flex items-center gap-0.5 max-w-[95vw]">
    <!-- All Off -->
    <button
      onclick={allLightsOff}
      class="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all
             hover:bg-surface-recessed active:scale-95"
    >
      <span class="{pendingActions.has('off') ? 'animate-pulse' : ''}">
        <Power class="w-5 h-5" />
      </span>
      <span class="text-[10px] text-content-secondary">All Off</span>
    </button>

    <!-- Day preset -->
    {#if presets['day']}
      <button
        onclick={() => handlePreset('day')}
        class="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all
               hover:bg-surface-recessed active:scale-95"
      >
        <span class="{pendingActions.has('day') ? 'animate-pulse' : ''}">
          <Sun class="w-5 h-5" />
        </span>
        <span class="text-[10px] text-content-secondary">Day</span>
      </button>
    {/if}

    <!-- Evening preset -->
    {#if presets['evening']}
      <button
        onclick={() => handlePreset('evening')}
        class="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all
               hover:bg-surface-recessed active:scale-95"
      >
        <span class="{pendingActions.has('evening') ? 'animate-pulse' : ''}">
          <Sunset class="w-5 h-5" />
        </span>
        <span class="text-[10px] text-content-secondary">Evening</span>
      </button>
    {/if}

    <!-- Night preset -->
    {#if presets['night']}
      <button
        onclick={() => handlePreset('night')}
        class="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all
               hover:bg-surface-recessed active:scale-95"
      >
        <span class="{pendingActions.has('night') ? 'animate-pulse' : ''}">
          <Moon class="w-5 h-5" />
        </span>
        <span class="text-[10px] text-content-secondary">Night</span>
      </button>
    {/if}

    <!-- Divider -->
    {#if Object.keys(presets).length > 3}
      <div class="w-px h-8 bg-stroke-default mx-1"></div>

      <!-- More button -->
      <button
        onclick={() => { expanded = !expanded; heaterExpanded = false; }}
        class="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all
               hover:bg-surface-recessed active:scale-95
               {expanded ? 'bg-surface-recessed' : ''}"
      >
        {#if expanded}
          <X class="w-5 h-5" />
        {:else}
          <MoreHorizontal class="w-5 h-5" />
        {/if}
        <span class="text-[10px] text-content-secondary">{expanded ? 'Close' : 'More'}</span>
      </button>
    {/if}

    <!-- Heater divider -->
    {#if store.heaterPresets.length > 0}
      <div class="w-px h-8 bg-stroke-default mx-1"></div>

      <!-- Heater button -->
      <button
        onclick={() => { heaterExpanded = !heaterExpanded; expanded = false; }}
        class="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all
               hover:bg-surface-recessed active:scale-95
               {heaterExpanded ? 'bg-surface-recessed' : ''}"
      >
        {#if heaterExpanded}
          <X class="w-5 h-5" />
        {:else}
          <Thermometer class="w-5 h-5" />
        {/if}
        <span class="text-[10px] text-content-secondary">{heaterExpanded ? 'Close' : 'Heat'}</span>
      </button>
    {/if}
  </div>
</div>
