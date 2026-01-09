<script lang="ts">
  import type { RoborockStatus } from '$lib/types';
  import { sendRoborockCommand, getRoborockRooms, getRoborockVolume, setRoborockVolume, setRoborockFanSpeed, setRoborockMopMode, cleanRoborockSegments, getRoborockConsumables, resetRoborockConsumable } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import { debounce } from '$lib/debounce';
  import DeviceDialog from './DeviceDialog.svelte';

  let { status, compact = false }: { status: RoborockStatus | null; compact?: boolean } = $props();
  let dialogOpen = $state(false);

  // Per-action pending states (instead of global loading)
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

  // New state for extended controls
  let rooms = $state<{ segmentId: number; name: string }[]>([]);
  let selectedRooms = $state<Set<number>>(new Set());
  let volume = $state(30);
  let previewVolume = $state<number | null>(null);
  let displayVolume = $derived(previewVolume ?? volume);
  let consumables = $state<{ mainBrushWorkTime: number; sideBrushWorkTime: number; filterWorkTime: number; sensorDirtyTime: number } | null>(null);
  let activeTab = $state<'controls' | 'rooms' | 'settings'>('controls');

  const STATE_MAP: Record<number, string> = {
    1: 'Starting',
    2: 'Charger disconnected',
    3: 'Idle',
    4: 'Remote control',
    5: 'Cleaning',
    6: 'Returning',
    7: 'Manual mode',
    8: 'Charging',
    9: 'Charging problem',
    10: 'Paused',
    11: 'Spot cleaning',
    12: 'Error',
    13: 'Shutting down',
    14: 'Updating',
    15: 'Docking',
    16: 'Going to target',
    17: 'Zoned cleaning',
    18: 'Segment cleaning',
    22: 'Emptying dustbin',
    23: 'Washing mop',
    26: 'Going to wash mop',
  };

  const FAN_MODES = [
    { mode: 101, name: 'Quiet', icon: '🔇' },
    { mode: 102, name: 'Balanced', icon: '⚖️' },
    { mode: 103, name: 'Turbo', icon: '💨' },
    { mode: 104, name: 'Max', icon: '🔥' },
  ];

  const MOP_MODES = [
    { mode: 200, name: 'Off', icon: '❌' },
    { mode: 201, name: 'Low', icon: '💧' },
    { mode: 202, name: 'Med', icon: '💧💧' },
    { mode: 203, name: 'High', icon: '💧💧💧' },
  ];

  function getStateName(state: number): string {
    return STATE_MAP[state] || `Unknown`;
  }

  function getFanModeName(fanPower: number): string {
    const mode = FAN_MODES.find(m => m.mode === fanPower);
    return mode ? mode.name : `${fanPower}%`;
  }

  function getMopModeName(waterBoxMode: number): string {
    const mode = MOP_MODES.find(m => m.mode === waterBoxMode);
    return mode ? mode.name : 'Unknown';
  }

  async function loadExtendedData() {
    try {
      const [roomsRes, volRes, consRes] = await Promise.all([
        getRoborockRooms(),
        getRoborockVolume(),
        getRoborockConsumables()
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

  // Debounced volume control
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
    if (newSet.has(segmentId)) {
      newSet.delete(segmentId);
    } else {
      newSet.add(segmentId);
    }
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
        return { color: 'text-success', bg: 'bg-success/20' };
      case 8:
        return { color: 'text-info', bg: 'bg-info/20' };
      case 3:
        return { color: 'text-content-tertiary', bg: 'bg-surface-recessed' };
      case 10:
        return { color: 'text-warning', bg: 'bg-warning/20' };
      case 6: case 15: case 16: case 26:
        return { color: 'text-device-sensors-text', bg: 'bg-device-sensors-bg' };
      case 12: case 9:
        return { color: 'text-error', bg: 'bg-error/20' };
      default:
        return { color: 'text-content-tertiary', bg: 'bg-surface-recessed' };
    }
  }

  let style = $derived(status ? stateStyle(status.state) : { color: 'text-content-tertiary', bg: 'bg-surface-recessed' });

  // Load extended data when dialog opens
  $effect(() => {
    if (dialogOpen) {
      loadExtendedData();
    }
  });
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
    <!-- Status icon -->
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 {style.bg} {style.color}"
      class:status-active={status?.state === 5 || status?.state === 11 || status?.state === 17 || status?.state === 18}
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"/>
      </svg>
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">Roborock</h4>
      {#if status}
        <p class="text-xs {style.color}">{getStateName(status.state)}</p>
      {:else}
        <p class="text-xs text-content-secondary">Offline</p>
      {/if}
    </div>

    <!-- Battery (compact) -->
    {#if compact && status}
      <div class="flex items-center gap-1 text-xs shrink-0">
        <svg class="w-3.5 h-3.5 {status.battery > 20 ? 'text-success' : 'text-error'}" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm4-3a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v4a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-4z"/>
          <path d="M8 4.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v8a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-8z"/>
        </svg>
        <span class="{status.battery > 20 ? 'text-content-secondary' : 'text-error'}">{status.battery}%</span>
      </div>
    {/if}
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title="Roborock">
  <div class="space-y-4">
    <!-- Status -->
    <div class="flex items-center justify-between">
      <span class="text-content-secondary">Status</span>
      <span class="font-medium {style.color}">
        {status ? getStateName(status.state) : 'Offline'}
      </span>
    </div>

    {#if status}
      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-surface-recessed rounded-xl p-4 text-center">
          <span class="text-xs text-content-secondary">Battery</span>
          <p class="text-3xl font-bold mt-1 {status.battery > 20 ? 'text-content-primary' : 'text-error'}">{status.battery}%</p>
        </div>
        <div class="bg-surface-recessed rounded-xl p-4 text-center">
          <span class="text-xs text-content-secondary">Fan Speed</span>
          <p class="text-2xl font-bold mt-1 text-content-primary">{getFanModeName(status.fanPower)}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-surface-recessed rounded-lg p-1">
        <button
          onclick={() => activeTab = 'controls'}
          class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
                 {activeTab === 'controls' ? 'bg-surface-elevated text-content-primary' : 'text-content-secondary hover:text-content-primary'}"
        >
          Controls
        </button>
        <button
          onclick={() => activeTab = 'rooms'}
          class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
                 {activeTab === 'rooms' ? 'bg-surface-elevated text-content-primary' : 'text-content-secondary hover:text-content-primary'}"
        >
          Rooms
        </button>
        <button
          onclick={() => activeTab = 'settings'}
          class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
                 {activeTab === 'settings' ? 'bg-surface-elevated text-content-primary' : 'text-content-secondary hover:text-content-primary'}"
        >
          Settings
        </button>
      </div>

      {#if activeTab === 'controls'}
        <!-- Control Buttons -->
        <div>
          <p class="text-sm text-content-secondary mb-2">Actions</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              onclick={() => sendCommand('start')}
              class="py-4 rounded-xl bg-success/20 text-success text-sm font-medium relative
                     hover:bg-success/30 transition-colors flex flex-col items-center gap-1"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
              </svg>
              Start
              {#if pendingCommand === 'start'}
                <span class="absolute top-1 right-1 w-2 h-2 bg-success rounded-full animate-pulse"></span>
              {/if}
            </button>
            <button
              onclick={() => sendCommand('pause')}
              class="py-4 rounded-xl bg-warning/20 text-warning text-sm font-medium relative
                     hover:bg-warning/30 transition-colors flex flex-col items-center gap-1"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Pause
              {#if pendingCommand === 'pause'}
                <span class="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full animate-pulse"></span>
              {/if}
            </button>
            <button
              onclick={() => sendCommand('home')}
              class="py-4 rounded-xl bg-info/20 text-info text-sm font-medium relative
                     hover:bg-info/30 transition-colors flex flex-col items-center gap-1"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              Home
              {#if pendingCommand === 'home'}
                <span class="absolute top-1 right-1 w-2 h-2 bg-info rounded-full animate-pulse"></span>
              {/if}
            </button>
          </div>
        </div>

        <!-- Additional Actions -->
        <div>
          <button
            onclick={() => sendCommand('find')}
            class="w-full py-3 rounded-xl bg-surface-recessed text-content-secondary text-sm font-medium relative
                   hover:bg-stroke-default transition-colors"
          >
            Find Robot
            {#if pendingCommand === 'find'}
              <span class="absolute top-2 right-2 w-2 h-2 bg-content-secondary rounded-full animate-pulse"></span>
            {/if}
          </button>
        </div>

        <!-- Fan Speed -->
        <div>
          <p class="text-sm text-content-secondary mb-2">Suction Power</p>
          <div class="grid grid-cols-4 gap-1">
            {#each FAN_MODES as fan}
              <button
                onclick={() => handleFanSpeed(fan.mode)}
                class="py-2 px-1 rounded-lg text-xs font-medium transition-colors relative
                       {displayFanPower === fan.mode
                         ? 'badge-audio ring-1 ring-device-audio-text/50'
                         : 'bg-surface-recessed text-content-secondary hover:bg-stroke-default'}"
              >
                <div class="text-base mb-0.5">{fan.icon}</div>
                {fan.name}
                {#if pendingFanMode === fan.mode}
                  <span class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-device-audio-text rounded-full animate-pulse"></span>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <!-- Mop Intensity -->
        <div>
          <p class="text-sm text-content-secondary mb-2">Mop Intensity</p>
          <div class="grid grid-cols-4 gap-1">
            {#each MOP_MODES as mop}
              <button
                onclick={() => handleMopMode(mop.mode)}
                class="py-2 px-1 rounded-lg text-xs font-medium transition-colors relative
                       {displayMopMode === mop.mode
                         ? 'badge-sensors ring-1 ring-device-sensors-text/50'
                         : 'bg-surface-recessed text-content-secondary hover:bg-stroke-default'}"
              >
                <div class="text-base mb-0.5">{mop.icon}</div>
                {mop.name}
                {#if pendingMopMode === mop.mode}
                  <span class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-device-sensors-text rounded-full animate-pulse"></span>
                {/if}
              </button>
            {/each}
          </div>
        </div>

      {:else if activeTab === 'rooms'}
        <!-- Room Selection -->
        <div>
          <p class="text-sm text-content-secondary mb-2">Select rooms to clean</p>
          {#if rooms.length > 0}
            <div class="grid grid-cols-2 gap-2">
              {#each rooms as room}
                <button
                  onclick={() => toggleRoom(room.segmentId)}
                  class="py-3 px-3 rounded-xl text-sm font-medium transition-colors text-left
                         {selectedRooms.has(room.segmentId)
                           ? 'badge-sensors ring-1 ring-device-sensors-text/50'
                           : 'bg-surface-recessed text-content-secondary hover:bg-stroke-default'}"
                >
                  {room.name}
                </button>
              {/each}
            </div>
            {#if selectedRooms.size > 0}
              <button
                onclick={cleanSelectedRooms}
                class="w-full mt-3 py-3 rounded-xl badge-sensors text-sm font-medium relative
                       hover:opacity-90 transition-colors"
              >
                Clean {selectedRooms.size} room{selectedRooms.size > 1 ? 's' : ''}
                {#if cleaningRooms}
                  <span class="absolute top-2 right-2 w-2 h-2 bg-device-sensors-text rounded-full animate-pulse"></span>
                {/if}
              </button>
            {/if}
          {:else}
            <p class="text-content-tertiary text-sm">Loading rooms...</p>
          {/if}
        </div>

      {:else if activeTab === 'settings'}
        <!-- Volume -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-content-secondary">Volume</span>
            <span class="text-sm font-medium text-content-primary">{displayVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={displayVolume}
            oninput={(e) => handleVolumeInput(parseInt(e.currentTarget.value))}
            class="w-full"
          />
        </div>

        <!-- Consumables -->
        {#if consumables}
          <div>
            <p class="text-sm text-content-secondary mb-3">Consumables</p>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-content-secondary">Main Brush</span>
                  <div class="flex items-center gap-2">
                    <span class="text-content-tertiary">{Math.round(consumables.mainBrushWorkTime / 3600)}h</span>
                    <button onclick={() => handleResetConsumable('main_brush_work_time')} class="text-[10px] px-1.5 py-0.5 rounded bg-surface-recessed hover:bg-stroke-default text-content-secondary relative {resettingConsumable === 'main_brush_work_time' ? 'opacity-50' : ''}">Reset</button>
                  </div>
                </div>
                <div class="h-2 bg-stroke-default rounded-full overflow-hidden">
                  <div class="h-full {getConsumableColor(getConsumablePercent(consumables.mainBrushWorkTime, 300))} transition-all" style="width: {getConsumablePercent(consumables.mainBrushWorkTime, 300)}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-content-secondary">Side Brush</span>
                  <div class="flex items-center gap-2">
                    <span class="text-content-tertiary">{Math.round(consumables.sideBrushWorkTime / 3600)}h</span>
                    <button onclick={() => handleResetConsumable('side_brush_work_time')} class="text-[10px] px-1.5 py-0.5 rounded bg-surface-recessed hover:bg-stroke-default text-content-secondary {resettingConsumable === 'side_brush_work_time' ? 'opacity-50' : ''}">Reset</button>
                  </div>
                </div>
                <div class="h-2 bg-stroke-default rounded-full overflow-hidden">
                  <div class="h-full {getConsumableColor(getConsumablePercent(consumables.sideBrushWorkTime, 200))} transition-all" style="width: {getConsumablePercent(consumables.sideBrushWorkTime, 200)}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-content-secondary">Filter</span>
                  <div class="flex items-center gap-2">
                    <span class="text-content-tertiary">{Math.round(consumables.filterWorkTime / 3600)}h</span>
                    <button onclick={() => handleResetConsumable('filter_work_time')} class="text-[10px] px-1.5 py-0.5 rounded bg-surface-recessed hover:bg-stroke-default text-content-secondary {resettingConsumable === 'filter_work_time' ? 'opacity-50' : ''}">Reset</button>
                  </div>
                </div>
                <div class="h-2 bg-stroke-default rounded-full overflow-hidden">
                  <div class="h-full {getConsumableColor(getConsumablePercent(consumables.filterWorkTime, 150))} transition-all" style="width: {getConsumablePercent(consumables.filterWorkTime, 150)}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-content-secondary">Sensors</span>
                  <div class="flex items-center gap-2">
                    <span class="text-content-tertiary">{Math.round(consumables.sensorDirtyTime / 3600)}h</span>
                    <button onclick={() => handleResetConsumable('sensor_dirty_time')} class="text-[10px] px-1.5 py-0.5 rounded bg-surface-recessed hover:bg-stroke-default text-content-secondary {resettingConsumable === 'sensor_dirty_time' ? 'opacity-50' : ''}">Reset</button>
                  </div>
                </div>
                <div class="h-2 bg-stroke-default rounded-full overflow-hidden">
                  <div class="h-full {getConsumableColor(getConsumablePercent(consumables.sensorDirtyTime, 30))} transition-all" style="width: {getConsumablePercent(consumables.sensorDirtyTime, 30)}%"></div>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <p class="text-content-tertiary text-sm">Loading consumables...</p>
        {/if}
      {/if}

      <!-- Device Info -->
      <div class="pt-4 border-t border-stroke-default space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-content-secondary">Model</span>
          <span class="font-mono text-xs text-content-tertiary">Roborock S8</span>
        </div>
      </div>
    {:else}
      <div class="text-center py-8 text-content-secondary">
        Start bridge to control robot
      </div>
    {/if}
  </div>
</DeviceDialog>
