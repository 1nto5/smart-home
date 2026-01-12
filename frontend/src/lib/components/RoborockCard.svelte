<script lang="ts">
  import type { RoborockStatus } from '$lib/types';
  import { sendRoborockCommand, getRoborockRooms, getRoborockVolume, setRoborockVolume, setRoborockFanSpeed, setRoborockMopMode, cleanRoborockSegments, getRoborockConsumables, resetRoborockConsumable } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import { debounce } from '$lib/debounce';
  import DeviceDialog from './DeviceDialog.svelte';
  import { VolumeX, Volume2, Scale, Wind, Flame, X, Droplet, Play, Pause, Home, Bot, Battery, BatteryLow, MapPin, Minus, Plus } from 'lucide-svelte';
  import type { ComponentType } from 'svelte';

  let { status, compact = false }: { status: RoborockStatus | null; compact?: boolean } = $props();
  let dialogOpen = $state(false);

  // Per-action pending states
  let pendingCommand = $state<string | null>(null);
  let pendingFanMode = $state<number | null>(null);
  let pendingMopMode = $state<number | null>(null);
  let cleaningRooms = $state(false);
  let resettingConsumable = $state<string | null>(null);

  // Optimistic states
  let optimisticFanPower = $state<number | null>(null);
  let optimisticMopMode = $state<number | null>(null);

  // Display values
  let displayFanPower = $derived(optimisticFanPower ?? status?.fanPower ?? 102);
  let displayMopMode = $derived(optimisticMopMode ?? status?.waterBoxMode ?? 200);

  // Extended controls state
  let rooms = $state<{ segmentId: number; name: string }[]>([]);
  let selectedRooms = $state<Set<number>>(new Set());
  let volume = $state(30);
  let previewVolume = $state<number | null>(null);
  let displayVolume = $derived(previewVolume ?? volume);
  let consumables = $state<{ mainBrushWorkTime: number; sideBrushWorkTime: number; filterWorkTime: number; sensorDirtyTime: number } | null>(null);
  let activeTab = $state<'controls' | 'rooms' | 'settings'>('controls');

  const STATE_MAP: Record<number, string> = {
    1: 'Starting', 2: 'Charger disconnected', 3: 'Idle', 4: 'Remote control',
    5: 'Cleaning', 6: 'Returning', 7: 'Manual mode', 8: 'Charging',
    9: 'Charging problem', 10: 'Paused', 11: 'Spot cleaning', 12: 'Error',
    13: 'Shutting down', 14: 'Updating', 15: 'Docking', 16: 'Going to target',
    17: 'Zoned cleaning', 18: 'Segment cleaning', 22: 'Emptying dustbin',
    23: 'Washing mop', 26: 'Going to wash mop',
  };

  const FAN_MODES: { mode: number; name: string; icon: ComponentType }[] = [
    { mode: 101, name: 'Quiet', icon: VolumeX },
    { mode: 102, name: 'Balanced', icon: Scale },
    { mode: 103, name: 'Turbo', icon: Wind },
    { mode: 104, name: 'Max', icon: Flame },
  ];

  const MOP_MODES: { mode: number; name: string; icon: ComponentType; count?: number }[] = [
    { mode: 200, name: 'Off', icon: X },
    { mode: 201, name: 'Low', icon: Droplet, count: 1 },
    { mode: 202, name: 'Med', icon: Droplet, count: 2 },
    { mode: 203, name: 'High', icon: Droplet, count: 3 },
  ];

  function getStateName(state: number): string {
    return STATE_MAP[state] || 'Unknown';
  }

  function getFanModeName(fanPower: number): string {
    const mode = FAN_MODES.find(m => m.mode === fanPower);
    return mode ? mode.name : `${fanPower}%`;
  }

  async function loadExtendedData() {
    try {
      const [roomsRes, volRes, consRes] = await Promise.all([
        getRoborockRooms(), getRoborockVolume(), getRoborockConsumables()
      ]);
      rooms = roomsRes.rooms;
      volume = volRes.volume;
      consumables = consRes;
    } catch (e) {
      console.error('Failed to load extended data:', e);
    }
  }

  async function sendCommand(cmd: string) {
    pendingCommand = cmd;
    try {
      await sendRoborockCommand(cmd);
      store.refreshRoborock();
    } catch (e) {
      console.error(e);
    }
    pendingCommand = null;
  }

  async function handleFanSpeed(mode: number) {
    optimisticFanPower = mode;
    pendingFanMode = mode;
    try {
      await setRoborockFanSpeed(mode);
      store.refreshRoborock();
    } catch (e) {
      console.error(e);
      optimisticFanPower = null;
    }
    pendingFanMode = null;
  }

  async function handleMopMode(mode: number) {
    optimisticMopMode = mode;
    pendingMopMode = mode;
    try {
      await setRoborockMopMode(mode);
      store.refreshRoborock();
    } catch (e) {
      console.error(e);
      optimisticMopMode = null;
    }
    pendingMopMode = null;
  }

  const [sendVolumeDebounced] = debounce(async (vol: number) => {
    try {
      await setRoborockVolume(vol);
      volume = vol;
    } catch (e) {
      console.error(e);
    }
    previewVolume = null;
  }, 300);

  function handleVolumeInput(newVolume: number) {
    previewVolume = newVolume;
    sendVolumeDebounced(newVolume);
  }

  function toggleRoom(segmentId: number) {
    const newSet = new Set(selectedRooms);
    if (newSet.has(segmentId)) newSet.delete(segmentId);
    else newSet.add(segmentId);
    selectedRooms = newSet;
  }

  async function cleanSelectedRooms() {
    if (selectedRooms.size === 0) return;
    cleaningRooms = true;
    try {
      await cleanRoborockSegments([...selectedRooms]);
      selectedRooms = new Set();
      store.refreshRoborock();
    } catch (e) {
      console.error(e);
    }
    cleaningRooms = false;
  }

  function getConsumablePercent(seconds: number, maxHours: number): number {
    const hours = seconds / 3600;
    return Math.max(0, Math.min(100, (hours / maxHours) * 100));
  }

  function getConsumableColor(percent: number): string {
    if (percent < 50) return 'bg-success';
    if (percent < 80) return 'bg-warning';
    return 'bg-error';
  }

  async function handleResetConsumable(consumable: string) {
    resettingConsumable = consumable;
    try {
      await resetRoborockConsumable(consumable);
      const consRes = await getRoborockConsumables();
      consumables = consRes;
    } catch (e) {
      console.error(e);
    }
    resettingConsumable = null;
  }

  function stateStyle(state: number): { color: string; bg: string } {
    switch (state) {
      case 5: case 11: case 17: case 18:
        return { color: 'text-success', bg: 'glow-sensors' };
      case 8:
        return { color: 'text-accent', bg: 'glow-robot' };
      case 3:
        return { color: 'text-content-tertiary', bg: '' };
      case 10:
        return { color: 'text-warning', bg: 'glow-lights' };
      case 6: case 15: case 16: case 26:
        return { color: 'text-device-sensors-text', bg: 'glow-sensors' };
      case 12: case 9:
        return { color: 'text-error', bg: '' };
      default:
        return { color: 'text-content-tertiary', bg: '' };
    }
  }

  let style = $derived(status ? stateStyle(status.state) : { color: 'text-content-tertiary', bg: '' });
  let isActive = $derived(status && [5, 11, 17, 18].includes(status.state));

  $effect(() => {
    if (dialogOpen) loadExtendedData();
  });
</script>

<!-- Card -->
<div
  onclick={() => dialogOpen = true}
  onkeydown={(e) => e.key === 'Enter' && (dialogOpen = true)}
  role="button"
  tabindex="0"
  class="card {compact ? 'p-3' : 'p-4'} w-full text-left cursor-pointer
         {isActive ? 'card-active glow-robot' : ''}"
>
  <div class="flex items-center gap-3">
    <!-- Status icon -->
    <div class="power-btn {style.bg} {isActive ? 'power-btn-on' : ''}">
      <Bot class="w-4 h-4" />
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">Roborock</h4>
      {#if status}
        <p class="text-xs {style.color} {isActive ? 'neon-text-subtle' : ''}">{getStateName(status.state)}</p>
      {:else}
        <p class="text-xs text-content-tertiary">Offline</p>
      {/if}
    </div>

    <!-- Battery -->
    {#if compact && status}
      <div class="flex items-center gap-1 text-[10px] shrink-0 px-1.5 py-0.5 rounded bg-surface-recessed">
        {#if status.battery > 20}
          <Battery class="w-3 h-3 text-success" />
        {:else}
          <BatteryLow class="w-3 h-3 text-error" />
        {/if}
        <span class="{status.battery > 20 ? 'text-content-secondary' : 'text-error'}">{status.battery}%</span>
      </div>
    {/if}
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title="Roborock">
  <div class="space-y-5">
    <!-- Status -->
    <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
      <span class="text-sm text-content-secondary uppercase tracking-wider">Status</span>
      <span class="font-medium text-sm {style.color} {isActive ? 'neon-text-subtle' : ''}">
        {status ? getStateName(status.state) : 'Offline'}
      </span>
    </div>

    {#if status}
      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl p-4 text-center {status.battery > 20 ? 'bg-surface-recessed border border-stroke-subtle' : 'bg-error/10 border border-error/30'}">
          <span class="text-xs text-content-tertiary uppercase tracking-wider">Battery</span>
          <p class="font-display text-3xl mt-2 {status.battery > 20 ? 'text-content-primary' : 'text-error'}">{status.battery}%</p>
        </div>
        <div class="rounded-xl p-4 text-center bg-surface-recessed border border-stroke-subtle">
          <span class="text-xs text-content-tertiary uppercase tracking-wider">Fan Speed</span>
          <p class="font-display text-2xl mt-2 text-content-primary">{getFanModeName(status.fanPower)}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-surface-recessed rounded-lg p-1 border border-stroke-subtle">
        {#each [{ id: 'controls', label: 'Controls' }, { id: 'rooms', label: 'Rooms' }, { id: 'settings', label: 'Settings' }] as tab}
          <button
            onclick={() => activeTab = tab.id as any}
            class="flex-1 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap
                   {activeTab === tab.id ? 'glow-robot power-btn-on' : 'text-content-secondary hover:text-content-primary'}"
          >
            {tab.label}
          </button>
        {/each}
      </div>

      {#if activeTab === 'controls'}
        <!-- Control Buttons -->
        <div class="grid grid-cols-3 gap-2">
          {#each [
            { cmd: 'start', icon: Play, label: 'Start', glow: 'glow-sensors' },
            { cmd: 'pause', icon: Pause, label: 'Pause', glow: 'glow-lights' },
            { cmd: 'home', icon: Home, label: 'Home', glow: 'glow-robot' }
          ] as action}
            <button
              onclick={() => sendCommand(action.cmd)}
              class="py-4 rounded-xl text-sm font-medium relative transition-all flex flex-col items-center gap-1.5
                     {action.glow} power-btn-on hover:scale-[1.02]"
            >
              <svelte:component this={action.icon} class="w-5 h-5" />
              {action.label}
              {#if pendingCommand === action.cmd}
                <div class="absolute inset-0 rounded-xl border-2 border-current animate-glow"></div>
              {/if}
            </button>
          {/each}
        </div>

        <!-- Find Button -->
        <button
          onclick={() => sendCommand('find')}
          class="w-full py-3 rounded-xl bg-surface-recessed border border-stroke-default text-content-secondary text-sm font-medium relative
                 hover:border-stroke-strong transition-all"
        >
          Find Robot
          {#if pendingCommand === 'find'}
            <div class="absolute inset-0 rounded-xl border-2 border-accent animate-glow"></div>
          {/if}
        </button>

        <!-- Fan Speed -->
        <div>
          <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Suction Power</p>
          <div class="grid grid-cols-4 gap-1">
            {#each FAN_MODES as fan}
              <button
                onclick={() => handleFanSpeed(fan.mode)}
                class="py-2.5 px-1 rounded-lg text-xs font-medium transition-all relative flex flex-col items-center gap-1
                       {displayFanPower === fan.mode ? 'glow-audio power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
              >
                <svelte:component this={fan.icon} class="w-4 h-4" />
                {fan.name}
                {#if pendingFanMode === fan.mode}
                  <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <!-- Mop Intensity -->
        <div>
          <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Mop Intensity</p>
          <div class="grid grid-cols-4 gap-1">
            {#each MOP_MODES as mop}
              <button
                onclick={() => handleMopMode(mop.mode)}
                class="py-2.5 px-1 rounded-lg text-xs font-medium transition-all relative flex flex-col items-center gap-1
                       {displayMopMode === mop.mode ? 'glow-sensors power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
              >
                <div class="flex items-center justify-center gap-0.5">
                  {#if mop.count}
                    {#each Array(mop.count) as _}
                      <svelte:component this={mop.icon} class="w-3 h-3" />
                    {/each}
                  {:else}
                    <svelte:component this={mop.icon} class="w-4 h-4" />
                  {/if}
                </div>
                {mop.name}
                {#if pendingMopMode === mop.mode}
                  <div class="absolute inset-0 rounded-lg border-2 border-current animate-glow"></div>
                {/if}
              </button>
            {/each}
          </div>
        </div>

      {:else if activeTab === 'rooms'}
        <!-- Room Selection -->
        <div>
          <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Select rooms to clean</p>
          {#if rooms.length > 0}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {#each rooms as room}
                <button
                  onclick={() => toggleRoom(room.segmentId)}
                  class="py-3 px-3 rounded-xl text-sm font-medium transition-all text-left flex items-center gap-2
                         {selectedRooms.has(room.segmentId) ? 'glow-sensors power-btn-on' : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
                >
                  <MapPin class="w-4 h-4 shrink-0" />
                  {room.name}
                </button>
              {/each}
            </div>
            {#if selectedRooms.size > 0}
              <button
                onclick={cleanSelectedRooms}
                class="w-full mt-3 py-3 rounded-xl glow-sensors power-btn-on text-sm font-medium relative
                       hover:scale-[1.02] transition-all"
              >
                Clean {selectedRooms.size} room{selectedRooms.size > 1 ? 's' : ''}
                {#if cleaningRooms}
                  <div class="absolute inset-0 rounded-xl border-2 border-current animate-glow"></div>
                {/if}
              </button>
            {/if}
          {:else}
            <p class="text-content-tertiary text-sm text-center py-4">Loading rooms...</p>
          {/if}
        </div>

      {:else if activeTab === 'settings'}
        <!-- Volume -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs text-content-tertiary uppercase tracking-wider">Volume</span>
            <span class="font-display text-lg text-device-sensors-text neon-text-subtle">{displayVolume}%</span>
          </div>
          <div class="flex gap-2 items-center">
            <button
              onclick={() => handleVolumeInput(Math.max(0, displayVolume - 10))}
              class="w-10 h-10 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong hover:text-content-primary transition-all flex items-center justify-center"
            >
              <Minus class="w-5 h-5" />
            </button>
            <div class="flex-1 h-10 rounded-lg bg-surface-recessed border border-stroke-default overflow-hidden relative">
              <div
                class="absolute inset-y-0 left-0 bg-device-sensors-text/30 transition-all duration-150"
                style="width: {displayVolume}%"
              ></div>
              <div
                class="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-device-sensors-text shadow-[0_0_10px_var(--color-sensors-glow)] transition-all duration-150"
                style="left: calc({displayVolume}% - 8px)"
              ></div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={displayVolume}
                oninput={(e) => handleVolumeInput(parseInt(e.currentTarget.value))}
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <button
              onclick={() => handleVolumeInput(Math.min(100, displayVolume + 10))}
              class="w-10 h-10 rounded-lg bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong hover:text-content-primary transition-all flex items-center justify-center"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Consumables -->
        {#if consumables}
          <div>
            <p class="text-xs text-content-tertiary uppercase tracking-wider mb-3">Consumables</p>
            <div class="space-y-3">
              {#each [
                { key: 'main_brush_work_time', label: 'Main Brush', time: consumables.mainBrushWorkTime, max: 300 },
                { key: 'side_brush_work_time', label: 'Side Brush', time: consumables.sideBrushWorkTime, max: 200 },
                { key: 'filter_work_time', label: 'Filter', time: consumables.filterWorkTime, max: 150 },
                { key: 'sensor_dirty_time', label: 'Sensors', time: consumables.sensorDirtyTime, max: 30 }
              ] as item}
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-content-secondary">{item.label}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-content-tertiary">{Math.round(item.time / 3600)}h</span>
                      <button
                        onclick={() => handleResetConsumable(item.key)}
                        class="text-[10px] px-1.5 py-0.5 rounded bg-surface-recessed hover:bg-stroke-default text-content-secondary uppercase tracking-wider {resettingConsumable === item.key ? 'opacity-50' : ''}"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div class="h-2 bg-surface-recessed rounded-full overflow-hidden border border-stroke-subtle">
                    <div class="h-full {getConsumableColor(getConsumablePercent(item.time, item.max))} transition-all" style="width: {getConsumablePercent(item.time, item.max)}%"></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <p class="text-content-tertiary text-sm text-center py-4">Loading consumables...</p>
        {/if}
      {/if}

    {:else}
      <div class="text-center py-8">
        <Bot class="w-12 h-12 mx-auto mb-3 text-content-tertiary opacity-50" />
        <p class="text-content-tertiary">Start bridge to control robot</p>
      </div>
    {/if}
  </div>
</DeviceDialog>
