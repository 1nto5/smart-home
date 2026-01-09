<script lang="ts">
  import type { Preset } from '$lib/types';
  import { applyPreset, getPresets, controlLamp, getLamps } from '$lib/api';
  import { store } from '$lib/stores.svelte';

  let presets = $state<Record<string, Preset>>({});
  let loading = $state<string | null>(null);
  let expanded = $state(false);

  $effect(() => {
    getPresets().then(p => presets = p).catch(() => {});
  });

  async function handlePreset(name: string) {
    loading = name;
    try {
      await applyPreset(name);
      await store.refreshLamps();
    } catch (e) {
      console.error(e);
    }
    loading = null;
    expanded = false;
  }

  async function allLightsOff() {
    loading = 'off';
    try {
      // Turn off all lamps
      const lamps = store.lamps.filter(l => l.category === 'lamp');
      await Promise.all(lamps.map(l => controlLamp(l.id, { power: false })));
      await store.refreshLamps();
    } catch (e) {
      console.error(e);
    }
    loading = null;
  }

  const presetIcons: Record<string, string> = {
    day: '☀️',
    morning: '🌅',
    evening: '🌆',
    night: '🌙',
    off: '⚫',
    bright: '💡',
    dim: '🕯️',
    warm: '🔥',
    cool: '❄️',
    relax: '🛋️',
    focus: '🎯',
    movie: '🎬',
  };

  function getIcon(name: string): string {
    return presetIcons[name.toLowerCase()] || '💡';
  }
</script>

<div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
  <!-- Expanded panel -->
  {#if expanded && Object.keys(presets).length > 0}
    <div class="quick-bar rounded-2xl px-3 py-3 mb-2 animate-fade-in">
      <div class="grid grid-cols-3 gap-2 min-w-[220px]">
        {#each Object.entries(presets) as [name, preset] (name)}
          <button
            onclick={() => handlePreset(name)}
            disabled={loading !== null}
            class="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all
                   hover:bg-white/5 active:scale-95 disabled:opacity-50"
          >
            <span class="text-xl {loading === name ? 'animate-pulse' : ''}">{getIcon(name)}</span>
            <span class="text-xs text-[var(--muted)] capitalize">{preset.name || name}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Main bar -->
  <div class="quick-bar rounded-2xl px-2 py-2 flex items-center gap-0.5">
    <!-- All Off -->
    <button
      onclick={allLightsOff}
      disabled={loading !== null}
      class="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all
             hover:bg-white/5 active:scale-95 disabled:opacity-50"
    >
      <span class="text-xl {loading === 'off' ? 'animate-pulse' : ''}">⚡</span>
      <span class="text-[10px] text-[var(--muted)]">All Off</span>
    </button>

    <!-- Day preset -->
    {#if presets['day']}
      <button
        onclick={() => handlePreset('day')}
        disabled={loading !== null}
        class="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all
               hover:bg-white/5 active:scale-95 disabled:opacity-50"
      >
        <span class="text-xl {loading === 'day' ? 'animate-pulse' : ''}">☀️</span>
        <span class="text-[10px] text-[var(--muted)]">Day</span>
      </button>
    {/if}

    <!-- Evening preset -->
    {#if presets['evening']}
      <button
        onclick={() => handlePreset('evening')}
        disabled={loading !== null}
        class="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all
               hover:bg-white/5 active:scale-95 disabled:opacity-50"
      >
        <span class="text-xl {loading === 'evening' ? 'animate-pulse' : ''}">🌆</span>
        <span class="text-[10px] text-[var(--muted)]">Evening</span>
      </button>
    {/if}

    <!-- Night preset -->
    {#if presets['night']}
      <button
        onclick={() => handlePreset('night')}
        disabled={loading !== null}
        class="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all
               hover:bg-white/5 active:scale-95 disabled:opacity-50"
      >
        <span class="text-xl {loading === 'night' ? 'animate-pulse' : ''}">🌙</span>
        <span class="text-[10px] text-[var(--muted)]">Night</span>
      </button>
    {/if}

    <!-- Divider -->
    {#if Object.keys(presets).length > 3}
      <div class="w-px h-8 bg-[var(--glass-border)] mx-1"></div>

      <!-- More button -->
      <button
        onclick={() => expanded = !expanded}
        class="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all
               hover:bg-white/5 active:scale-95
               {expanded ? 'bg-white/5' : ''}"
      >
        <span class="text-xl">{expanded ? '✕' : '⋯'}</span>
        <span class="text-[10px] text-[var(--muted)]">{expanded ? 'Close' : 'More'}</span>
      </button>
    {/if}
  </div>
</div>
