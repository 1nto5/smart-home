<script lang="ts">
  import type { YamahaDevice, YamahaStatus } from '$lib/types';
  import { getYamahaStatus, controlYamaha } from '$lib/api';
  import { translateDeviceName } from '$lib/translations';
  import { debounce } from '$lib/debounce';
  import DeviceDialog from './DeviceDialog.svelte';

  let { device, compact = false }: { device: YamahaDevice; compact?: boolean } = $props();
  let displayName = $derived(translateDeviceName(device.name));
  let status = $state<YamahaStatus | null>(null);
  let fetched = $state(false);
  let dialogOpen = $state(false);

  // Optimistic state
  let optimisticPower = $state<'on' | 'standby' | null>(null);
  let isPowerPending = $state(false);

  // Local slider state for preview
  let previewVolume = $state<number | null>(null);
  let previewSubwooferVol = $state<number | null>(null);

  // Display values (preview or actual)
  let displayPower = $derived(optimisticPower ?? status?.power ?? 'standby');
  let displayVolume = $derived(previewVolume ?? status?.volume ?? 0);
  let displaySubwooferVol = $derived(previewSubwooferVol ?? status?.subwoofer_volume ?? 0);

  $effect(() => {
    if (!fetched && device.last_status) {
      try {
        status = JSON.parse(device.last_status);
      } catch {}
    }
  });

  $effect(() => {
    if (!fetched) {
      fetched = true;
      getYamahaStatus(device.id)
        .then(res => status = res.status)
        .catch(() => {});
    }
  });

  async function togglePower() {
    const newPower = displayPower === 'on' ? 'standby' : 'on';
    optimisticPower = newPower;
    isPowerPending = true;
    try {
      await controlYamaha(device.id, { power: newPower === 'on' });
      refreshStatus();
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

  // Debounced volume controls
  const [sendVolumeDebounced] = debounce(async (vol: number) => {
    try {
      await controlYamaha(device.id, { volume: vol });
      if (status) status = { ...status, volume: vol };
    } catch (e) {
      console.error(e);
    }
    previewVolume = null;
  }, 300);

  const [sendSubwooferDebounced] = debounce(async (vol: number) => {
    try {
      await controlYamaha(device.id, { subwoofer_volume: vol });
      if (status) status = { ...status, subwoofer_volume: vol };
    } catch (e) {
      console.error(e);
    }
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
    try {
      await controlYamaha(device.id, { clear_voice: newVal });
    } catch (e) {
      console.error(e);
      if (status) status = { ...status, clear_voice: !newVal };
    }
  }

  async function toggleBassExtension() {
    const newVal = !status?.bass_extension;
    if (status) status = { ...status, bass_extension: newVal };
    try {
      await controlYamaha(device.id, { bass_extension: newVal });
    } catch (e) {
      console.error(e);
      if (status) status = { ...status, bass_extension: !newVal };
    }
  }

  const inputs = ['tv', 'bluetooth'];

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
  class="card transition-card hover:scale-[1.02] {compact ? 'p-2.5' : 'p-3'} w-full text-left cursor-pointer"
>
  <div class="flex items-center gap-2.5">
    <!-- Power toggle -->
    <button
      onclick={(e) => { e.stopPropagation(); togglePower(); }}
      disabled={!status}
      class="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 relative
             {displayPower === 'on' ? 'badge-audio' : 'bg-surface-recessed text-content-tertiary'}
             hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      class:status-active={displayPower === 'on'}
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd"/>
      </svg>
      {#if isPowerPending}
        <span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-device-audio-text rounded-full animate-pulse"></span>
      {/if}
    </button>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">{displayName}</h4>
      {#if displayPower === 'on'}
        <p class="text-xs text-content-secondary">
          {status?.mute ? 'Muted' : `${displayVolume}%`} · {status?.input}
        </p>
      {:else}
        <p class="text-xs text-content-secondary">{status ? 'Standby' : 'Offline'}</p>
      {/if}
    </div>
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title={displayName}>
  <div class="space-y-4">
    <!-- Status -->
    <div class="flex items-center justify-between">
      <span class="text-content-secondary">Status</span>
      <span class="font-medium {displayPower === 'on' ? 'text-device-audio-text' : 'text-content-tertiary'}">
        {displayPower === 'on' ? 'On' : status ? 'Standby' : 'Offline'}
      </span>
    </div>

    {#if status}
      <!-- Power Button -->
      <button
        onclick={togglePower}
        class="w-full py-4 rounded-xl text-lg font-medium transition-all relative
               {displayPower === 'on' ? 'badge-audio' : 'bg-surface-recessed text-content-secondary'}
               hover:scale-[1.02]"
      >
        {displayPower === 'on' ? 'Turn Off' : 'Turn On'}
        {#if isPowerPending}
          <span class="absolute top-2 right-2 w-2 h-2 bg-device-audio-text rounded-full animate-pulse"></span>
        {/if}
      </button>

      {#if displayPower === 'on'}
        <!-- Volume -->
        <div>
          <div class="flex justify-between text-sm text-content-secondary mb-2">
            <span>Volume</span>
            <span class="font-medium text-content-primary">{status.mute ? 'Muted' : `${displayVolume}%`}</span>
          </div>
          <div class="flex gap-2 items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={displayVolume}
              oninput={(e) => handleVolumeInput(parseInt(e.currentTarget.value))}
              class="flex-1"
            />
            <button
              onclick={toggleMute}
              class="w-10 h-10 rounded-lg transition-colors text-lg
                     {status.mute ? 'bg-error/20 text-error' : 'bg-surface-recessed text-content-secondary'}
                     hover:bg-stroke-default"
            >
              {status.mute ? '🔇' : '🔊'}
            </button>
          </div>
        </div>

        <!-- Input Selection -->
        <div>
          <p class="text-sm text-content-secondary mb-2">Input</p>
          <div class="grid grid-cols-2 gap-2">
            {#each inputs as inp}
              <button
                onclick={() => setInput(inp)}
                class="py-3 text-sm rounded-lg transition-colors uppercase
                       {status.input === inp ? 'badge-audio' : 'bg-surface-recessed text-content-secondary hover:bg-stroke-default'}"
              >
                {inp === 'bluetooth' ? 'BT' : 'TV'}
              </button>
            {/each}
          </div>
        </div>

        <!-- Sound Program -->
        <div>
          <p class="text-sm text-content-secondary mb-2">Sound Program</p>
          <div class="grid grid-cols-3 gap-2">
            {#each soundPrograms as prog}
              <button
                onclick={() => setSoundProgram(prog.id)}
                class="py-2.5 text-sm rounded-lg transition-colors
                       {status.sound_program === prog.id ? 'badge-audio' : 'bg-surface-recessed text-content-secondary hover:bg-stroke-default'}"
              >
                {prog.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Audio Toggles -->
        <div>
          <p class="text-sm text-content-secondary mb-2">Audio</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              onclick={toggleClearVoice}
              class="py-3 text-sm rounded-lg transition-colors
                     {status.clear_voice ? 'badge-audio' : 'bg-surface-recessed text-content-secondary hover:bg-stroke-default'}"
            >
              Clear Voice
            </button>
            <button
              onclick={toggleBassExtension}
              class="py-3 text-sm rounded-lg transition-colors
                     {status.bass_extension ? 'badge-audio' : 'bg-surface-recessed text-content-secondary hover:bg-stroke-default'}"
            >
              Bass Ext.
            </button>
          </div>
        </div>

        <!-- Subwoofer Volume -->
        <div>
          <div class="flex justify-between text-sm text-content-secondary mb-2">
            <span>Subwoofer</span>
            <span class="font-medium text-content-primary">{displaySubwooferVol > 0 ? '+' : ''}{displaySubwooferVol}</span>
          </div>
          <input
            type="range"
            min="-6"
            max="6"
            step="1"
            value={displaySubwooferVol}
            oninput={(e) => handleSubwooferInput(parseInt(e.currentTarget.value))}
            class="w-full"
          />
        </div>
      {/if}

    {/if}
  </div>
</DeviceDialog>
