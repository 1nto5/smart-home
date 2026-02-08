<script lang="ts">
  import type { YamahaDevice, YamahaStatus } from '$lib/types';
  import { controlYamaha } from '$lib/api';
  import { translateDeviceName } from '$lib/translations';
  import { debounce } from '$lib/debounce';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Volume2, VolumeX, Tv, Bluetooth, Mic, Radio } from 'lucide-svelte';
  import DeviceSlider from './DeviceSlider.svelte';
  import StatusRow from './StatusRow.svelte';
  import DialogPowerButton from './DialogPowerButton.svelte';

  let { device, compact = false }: { device: YamahaDevice; compact?: boolean } = $props();
  let displayName = $derived(translateDeviceName(device.name));
  let status = $state<YamahaStatus | null>(null);
  let dialogOpen = $state(false);

  // Optimistic state
  let optimisticPower = $state<'on' | 'standby' | null>(null);
  let isPowerPending = $state(false);
  let pendingInput = $state<string | null>(null);
  let pendingProgram = $state<string | null>(null);

  // Local slider state
  let previewVolume = $state<number | null>(null);
  let previewSubwooferVol = $state<number | null>(null);

  // Display values
  let displayPower = $derived(optimisticPower ?? status?.power ?? 'standby');
  let displayVolume = $derived(previewVolume ?? status?.volume ?? 0);
  let displaySubwooferVol = $derived(previewSubwooferVol ?? status?.subwoofer_volume ?? 0);

  // Parse cached status from DB (updated via WS broadcasts)
  $effect(() => {
    if (device.last_status) {
      try { status = JSON.parse(device.last_status); } catch { /* ignore parse errors */ }
    }
  });

  async function togglePower() {
    const newPower = displayPower === 'on' ? 'standby' : 'on';
    optimisticPower = newPower;
    isPowerPending = true;
    try {
      await controlYamaha(device.id, { power: newPower === 'on' });
      // WS broadcast will update yamaha status
    } catch (e) {
      console.error(e);
      optimisticPower = null;
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
    pendingInput = input;
    if (status) status = { ...status, input };
    try {
      await controlYamaha(device.id, { input });
    } catch (e) {
      console.error(e);
      if (status && oldInput) status = { ...status, input: oldInput };
    }
    pendingInput = null;
  }

  async function setSoundProgram(program: string) {
    const oldProgram = status?.sound_program;
    pendingProgram = program;
    if (status) status = { ...status, sound_program: program };
    try {
      await controlYamaha(device.id, { sound_program: program });
    } catch (e) {
      console.error(e);
      if (status && oldProgram) status = { ...status, sound_program: oldProgram };
    }
    pendingProgram = null;
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
      disabled={!status || isPowerPending}
      class="power-btn glow-audio relative {displayPower === 'on' ? 'power-btn-on' : ''}
             disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Volume2 class="w-4 h-4 {isPowerPending ? 'animate-spin' : ''}" />
      {#if isPowerPending}
        <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
      {/if}
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
    <StatusRow label="Status">
      <span class="{displayPower === 'on' ? 'text-device-audio-text neon-text-subtle' : 'text-content-tertiary'}">
        {displayPower === 'on' ? 'Active' : status ? 'Standby' : 'Offline'}
      </span>
    </StatusRow>

    {#if status}
      <!-- Power Button -->
      <DialogPowerButton
        isOn={displayPower === 'on'}
        isPending={isPowerPending}
        onclick={togglePower}
        glowClass="glow-audio"
      />

      {#if displayPower === 'on'}
        <!-- Volume -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs text-content-tertiary uppercase tracking-wider">Volume</span>
            <span class="font-display text-lg {status.mute ? 'text-error' : 'text-device-audio-text neon-text-subtle'}">{status.mute ? 'Muted' : `${displayVolume}%`}</span>
          </div>
          <DeviceSlider
            value={displayVolume}
            min={0}
            max={100}
            step={5}
            color="--color-audio"
            oninput={handleVolumeInput}
          >
            {#snippet after()}
              <button
                onclick={toggleMute}
                class="w-10 h-10 rounded-lg transition-all flex items-center justify-center
                       {status.mute ? 'bg-error/20 text-error border border-error/50' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}
                       hover:scale-105"
              >
                {#if status.mute}
                  <VolumeX class="w-5 h-5" />
                {:else}
                  <Volume2 class="w-5 h-5" />
                {/if}
              </button>
            {/snippet}
          </DeviceSlider>
        </div>

        <!-- Subwoofer Volume -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs text-content-tertiary uppercase tracking-wider">Subwoofer</span>
            <span class="font-display text-lg text-device-audio-text neon-text-subtle">{displaySubwooferVol > 0 ? '+' : ''}{displaySubwooferVol}</span>
          </div>
          <DeviceSlider
            value={displaySubwooferVol}
            min={-4}
            max={4}
            color="--color-audio"
            oninput={handleSubwooferInput}
          />
        </div>

        <!-- Input Selection -->
        <div>
          <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Input Source</p>
          <div class="grid grid-cols-2 gap-2">
            {#each inputs as inp}
              {@const InputIcon = inp.icon}
              <button
                onclick={() => setInput(inp.id)}
                disabled={pendingInput !== null}
                class="py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium relative disabled:opacity-50
                       {status.input === inp.id ? 'glow-audio power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
              >
                <InputIcon class="w-4 h-4 {pendingInput === inp.id ? 'animate-spin' : ''}" />
                {inp.label}
                {#if pendingInput === inp.id}
                  <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
                {/if}
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
                disabled={pendingProgram !== null}
                class="py-2.5 text-sm rounded-lg transition-all font-medium relative disabled:opacity-50
                       {status.sound_program === prog.id ? 'glow-audio power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
              >
                {prog.label}
                {#if pendingProgram === prog.id}
                  <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
                {/if}
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
