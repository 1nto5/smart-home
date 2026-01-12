<script lang="ts">
  import type { YamahaDevice, YamahaStatus } from '$lib/types';
  import { getYamahaStatus, controlYamaha } from '$lib/api';
  import { translateDeviceName } from '$lib/translations';
  import { debounce } from '$lib/debounce';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Volume2, VolumeX, Power, Tv, Bluetooth, Music, Gamepad2, Mic, Radio } from 'lucide-svelte';

  let { device, compact = false }: { device: YamahaDevice; compact?: boolean } = $props();
  let displayName = $derived(translateDeviceName(device.name));
  let status = $state<YamahaStatus | null>(null);
  let fetched = $state(false);
  let dialogOpen = $state(false);

  // Optimistic state
  let optimisticPower = $state<'on' | 'standby' | null>(null);
  let isPowerPending = $state(false);

  // Local slider state
  let previewVolume = $state<number | null>(null);
  let previewSubwooferVol = $state<number | null>(null);

  // Display values
  let displayPower = $derived(optimisticPower ?? status?.power ?? 'standby');
  let displayVolume = $derived(previewVolume ?? status?.volume ?? 0);
  let displaySubwooferVol = $derived(previewSubwooferVol ?? status?.subwoofer_volume ?? 0);

  $effect(() => {
    if (!fetched && device.last_status) {
      try { status = JSON.parse(device.last_status); } catch {}
    }
  });

  $effect(() => {
    if (!fetched) {
      fetched = true;
      getYamahaStatus(device.id).then(res => status = res.status).catch(() => {});
    }
  });

  async function togglePower() {
    const newPower = displayPower === 'on' ? 'standby' : 'on';
    optimisticPower = newPower;
    isPowerPending = true;
    try {
      await controlYamaha(device.id, { power: newPower === 'on' });
      // Soundbar needs time to change power state before status reflects it
      await new Promise(r => setTimeout(r, 1500));
      await refreshStatus();
      // Keep optimistic state if server status doesn't match yet
      if (status?.power !== newPower) {
        optimisticPower = newPower;
      }
    } catch (e) {
      console.error(e);
      optimisticPower = null;
      isPowerPending = false;
    }
  }

  async function refreshStatus() {
    try {
      const res = await getYamahaStatus(device.id);
      status = res.status;
      optimisticPower = null;
    } catch (e) {
      console.error(e);
    }
    isPowerPending = false;
  }

  const [sendVolumeDebounced] = debounce(async (vol: number) => {
    try {
      await controlYamaha(device.id, { volume: vol });
      if (status) status = { ...status, volume: vol };
    } catch (e) { console.error(e); }
    previewVolume = null;
  }, 300);

  const [sendSubwooferDebounced] = debounce(async (vol: number) => {
    try {
      await controlYamaha(device.id, { subwoofer_volume: vol });
      if (status) status = { ...status, subwoofer_volume: vol };
    } catch (e) { console.error(e); }
    previewSubwooferVol = null;
  }, 300);

  function handleVolumeInput(vol: number) {
    previewVolume = vol;
    sendVolumeDebounced(vol);
  }

  function handleSubwooferInput(vol: number) {
    previewSubwooferVol = vol;
    sendSubwooferDebounced(vol);
  }

  async function toggleMute() {
    const newMute = !status?.mute;
    if (status) status = { ...status, mute: newMute };
    try {
      await controlYamaha(device.id, { mute: newMute });
    } catch (e) {
      console.error(e);
      if (status) status = { ...status, mute: !newMute };
    }
  }

  async function setInput(input: string) {
    const oldInput = status?.input;
    if (status) status = { ...status, input };
    try {
      await controlYamaha(device.id, { input });
    } catch (e) {
      console.error(e);
      if (status && oldInput) status = { ...status, input: oldInput };
    }
  }

  async function setSoundProgram(program: string) {
    const oldProgram = status?.sound_program;
    if (status) status = { ...status, sound_program: program };
    try {
      await controlYamaha(device.id, { sound_program: program });
    } catch (e) {
      console.error(e);
      if (status && oldProgram) status = { ...status, sound_program: oldProgram };
    }
  }

  async function toggleClearVoice() {
    const newVal = !status?.clear_voice;
    if (status) status = { ...status, clear_voice: newVal };
    try { await controlYamaha(device.id, { clear_voice: newVal }); }
    catch (e) { console.error(e); if (status) status = { ...status, clear_voice: !newVal }; }
  }

  async function toggleBassExtension() {
    const newVal = !status?.bass_extension;
    if (status) status = { ...status, bass_extension: newVal };
    try { await controlYamaha(device.id, { bass_extension: newVal }); }
    catch (e) { console.error(e); if (status) status = { ...status, bass_extension: !newVal }; }
  }

  const inputs = [
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'bluetooth', label: 'BT', icon: Bluetooth },
  ];

  const soundPrograms = [
    { id: 'movie', label: 'Movie' },
    { id: 'music', label: 'Music' },
    { id: 'sports', label: 'Sports' },
    { id: 'game', label: 'Game' },
    { id: 'tv_program', label: 'TV' },
    { id: 'stereo', label: 'Stereo' },
  ];
</script>

<!-- Card -->
<div
  onclick={() => dialogOpen = true}
  onkeydown={(e) => e.key === 'Enter' && (dialogOpen = true)}
  role="button"
  tabindex="0"
  class="card {compact ? 'p-3' : 'p-4'} w-full text-left cursor-pointer
         {displayPower === 'on' ? 'card-active glow-audio' : ''}"
>
  <div class="flex items-center gap-3">
    <!-- Power toggle -->
    <button
      onclick={(e) => { e.stopPropagation(); togglePower(); }}
      disabled={!status}
      class="power-btn glow-audio {displayPower === 'on' ? 'power-btn-on' : ''}
             disabled:opacity-40 disabled:cursor-not-allowed"
      class:pulse-ring={isPowerPending}
    >
      <Volume2 class="w-4 h-4" />
    </button>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">{displayName}</h4>
      {#if displayPower === 'on'}
        <p class="text-xs text-content-secondary">
          <span class="{status?.mute ? 'text-error' : 'text-device-audio-text'}">{status?.mute ? 'Muted' : `${displayVolume}%`}</span>
          <span class="mx-1 text-content-tertiary">/</span>
          <span class="uppercase">{status?.input}</span>
        </p>
      {:else}
        <p class="text-xs text-content-tertiary">{status ? 'Standby' : 'Offline'}</p>
      {/if}
    </div>
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title={displayName}>
  <div class="space-y-5">
    <!-- Status -->
    <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
      <span class="text-sm text-content-secondary uppercase tracking-wider">Status</span>
      <span class="font-medium text-sm {displayPower === 'on' ? 'text-device-audio-text neon-text-subtle' : 'text-content-tertiary'}">
        {displayPower === 'on' ? 'Active' : status ? 'Standby' : 'Offline'}
      </span>
    </div>

    {#if status}
      <!-- Power Button -->
      <button
        onclick={togglePower}
        class="w-full py-4 rounded-xl font-semibold uppercase tracking-wider transition-all relative overflow-hidden
               {displayPower === 'on' ? 'glow-audio power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
      >
        <span class="relative z-10 flex items-center justify-center gap-2">
          <Power class="w-5 h-5" />
          {displayPower === 'on' ? 'Power Off' : 'Power On'}
        </span>
        {#if isPowerPending}
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        {/if}
      </button>

      {#if displayPower === 'on'}
        <!-- Volume -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs text-content-tertiary uppercase tracking-wider">Volume</span>
            <span class="font-display text-lg {status.mute ? 'text-error' : 'text-device-audio-text neon-text-subtle'}">{status.mute ? 'Muted' : `${displayVolume}%`}</span>
          </div>
          <div class="flex gap-2 items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={displayVolume}
              oninput={(e) => handleVolumeInput(parseInt(e.currentTarget.value))}
              class="flex-1"
              style="--color-accent: var(--color-audio-text); --color-accent-glow: var(--color-audio-glow);"
            />
            <button
              onclick={toggleMute}
              class="w-10 h-10 rounded-lg transition-all flex items-center justify-center
                     {status.mute ? 'bg-error/20 text-error border border-error/50' : 'bg-surface-recessed border border-stroke-default text-content-secondary'}
                     hover:scale-105"
            >
              {#if status.mute}
                <VolumeX class="w-5 h-5" />
              {:else}
                <Volume2 class="w-5 h-5" />
              {/if}
            </button>
          </div>
        </div>

        <!-- Subwoofer Volume -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs text-content-tertiary uppercase tracking-wider">Subwoofer</span>
            <span class="font-display text-lg text-content-primary">{displaySubwooferVol > 0 ? '+' : ''}{displaySubwooferVol}</span>
          </div>
          <input
            type="range"
            min="-4"
            max="4"
            step="1"
            value={displaySubwooferVol}
            oninput={(e) => handleSubwooferInput(parseInt(e.currentTarget.value))}
            class="w-full"
          />
        </div>

        <!-- Input Selection -->
        <div>
          <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Input Source</p>
          <div class="grid grid-cols-2 gap-2">
            {#each inputs as inp}
              <button
                onclick={() => setInput(inp.id)}
                class="py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium
                       {status.input === inp.id ? 'glow-audio power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
              >
                <svelte:component this={inp.icon} class="w-4 h-4" />
                {inp.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Sound Program -->
        <div>
          <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Sound Program</p>
          <div class="grid grid-cols-3 gap-2">
            {#each soundPrograms as prog}
              <button
                onclick={() => setSoundProgram(prog.id)}
                class="py-2.5 text-sm rounded-lg transition-all font-medium
                       {status.sound_program === prog.id ? 'glow-audio power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
              >
                {prog.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Audio Toggles -->
        <div>
          <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Audio Enhancements</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              onclick={toggleClearVoice}
              class="py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium
                     {status.clear_voice ? 'glow-audio power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
            >
              <Mic class="w-4 h-4" />
              Clear Voice
            </button>
            <button
              onclick={toggleBassExtension}
              class="py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium
                     {status.bass_extension ? 'glow-audio power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
            >
              <Radio class="w-4 h-4" />
              Bass Ext.
            </button>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</DeviceDialog>
