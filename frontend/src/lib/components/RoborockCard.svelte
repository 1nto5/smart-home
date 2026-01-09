<script lang="ts">
  import type { RoborockStatus } from '$lib/types';
  import { sendRoborockCommand, getRoborockRooms, getRoborockVolume, setRoborockVolume, setRoborockFanSpeed, setRoborockMopMode, cleanRoborockSegments, getRoborockConsumables, resetRoborockConsumable } from '$lib/api';
  import { store } from '$lib/stores.svelte';
  import DeviceDialog from './DeviceDialog.svelte';

  let { status, compact = false }: { status: RoborockStatus | null; compact?: boolean } = $props();
  let loading = $state(false);
  let dialogOpen = $state(false);

  // New state for extended controls
  let rooms = $state<{ segmentId: number; name: string }[]>([]);
  let selectedRooms = $state<Set<number>>(new Set());
  let volume = $state(30);
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
    loading = true;
    try {
      await sendRoborockCommand(cmd);
      await store.refreshRoborock();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleFanSpeed(mode: number) {
    loading = true;
    try {
      await setRoborockFanSpeed(mode);
      await store.refreshRoborock();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleMopMode(mode: number) {
    loading = true;
    try {
      await setRoborockMopMode(mode);
      await store.refreshRoborock();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  async function handleVolumeChange(newVolume: number) {
    volume = newVolume;
    try {
      await setRoborockVolume(newVolume);
    } catch (e) {
      console.error(e);
    }
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
    loading = true;
    try {
      await cleanRoborockSegments([...selectedRooms]);
      selectedRooms = new Set();
      await store.refreshRoborock();
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  function getConsumablePercent(seconds: number, maxHours: number): number {
    const hours = seconds / 3600;
    return Math.max(0, Math.min(100, (hours / maxHours) * 100));
  }

  function getConsumableColor(percent: number): string {
    if (percent < 50) return 'bg-green-500';
    if (percent < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  async function handleResetConsumable(consumable: string) {
    loading = true;
    try {
      await resetRoborockConsumable(consumable);
      const consRes = await getRoborockConsumables();
      consumables = consRes;
    } catch (e) {
      console.error(e);
    }
    loading = false;
  }

  function stateStyle(state: number): { color: string; bg: string } {
    switch (state) {
      case 5: case 11: case 17: case 18:
        return { color: 'text-green-400', bg: 'bg-green-500/20' };
      case 8:
        return { color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 3:
        return { color: 'text-zinc-400', bg: 'bg-zinc-800/60' };
      case 10:
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      case 6: case 15: case 16: case 26:
        return { color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
      case 12: case 9:
        return { color: 'text-red-400', bg: 'bg-red-500/20' };
      default:
        return { color: 'text-zinc-400', bg: 'bg-zinc-800/60' };
    }
  }

  let style = $derived(status ? stateStyle(status.state) : { color: 'text-zinc-500', bg: 'bg-zinc-800/60' });

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
  class="glass-card rounded-xl transition-card hover:scale-[1.02] {compact ? 'p-2.5' : 'p-3'} w-full text-left cursor-pointer"
>
  <div class="flex items-center gap-2.5">
    <!-- Status icon -->
    <div
      class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 {style.bg} {style.color}"
      class:status-active={status?.state === 5 || status?.state === 11 || status?.state === 17 || status?.state === 18}
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"/>
      </svg>
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm truncate">Roborock</h4>
      {#if status}
        <p class="text-xs {style.color}">{getStateName(status.state)}</p>
      {:else}
        <p class="text-xs text-[var(--muted)]">Offline</p>
      {/if}
    </div>

    <!-- Battery (compact) -->
    {#if compact && status}
      <div class="flex items-center gap-1 text-xs shrink-0">
        <svg class="w-3.5 h-3.5 {status.battery > 20 ? 'text-green-400' : 'text-red-400'}" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm4-3a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v4a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-4z"/>
          <path d="M8 4.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v8a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-8z"/>
        </svg>
        <span class="{status.battery > 20 ? 'text-zinc-400' : 'text-red-400'}">{status.battery}%</span>
      </div>
    {/if}
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title="Roborock">
  <div class="space-y-4">
    <!-- Status -->
    <div class="flex items-center justify-between">
      <span class="text-[var(--muted)]">Status</span>
      <span class="font-medium {style.color}">
        {status ? getStateName(status.state) : 'Offline'}
      </span>
    </div>

    {#if status}
      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-zinc-800/40 rounded-xl p-4 text-center">
          <span class="text-xs text-[var(--muted)]">Battery</span>
          <p class="text-3xl font-bold mt-1 {status.battery > 20 ? '' : 'text-red-400'}">{status.battery}%</p>
        </div>
        <div class="bg-zinc-800/40 rounded-xl p-4 text-center">
          <span class="text-xs text-[var(--muted)]">Fan Speed</span>
          <p class="text-2xl font-bold mt-1">{getFanModeName(status.fanPower)}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-zinc-800/40 rounded-lg p-1">
        <button
          onclick={() => activeTab = 'controls'}
          class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
                 {activeTab === 'controls' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}"
        >
          Controls
        </button>
        <button
          onclick={() => activeTab = 'rooms'}
          class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
                 {activeTab === 'rooms' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}"
        >
          Rooms
        </button>
        <button
          onclick={() => activeTab = 'settings'}
          class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
                 {activeTab === 'settings' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}"
        >
          Settings
        </button>
      </div>

      {#if activeTab === 'controls'}
        <!-- Control Buttons -->
        <div>
          <p class="text-sm text-[var(--muted)] mb-2">Actions</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              onclick={() => sendCommand('start')}
              disabled={loading}
              class="py-4 rounded-xl bg-green-500/20 text-green-400 text-sm font-medium
                     hover:bg-green-500/30 disabled:opacity-50 transition-colors flex flex-col items-center gap-1"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
              </svg>
              Start
            </button>
            <button
              onclick={() => sendCommand('pause')}
              disabled={loading}
              class="py-4 rounded-xl bg-yellow-500/20 text-yellow-400 text-sm font-medium
                     hover:bg-yellow-500/30 disabled:opacity-50 transition-colors flex flex-col items-center gap-1"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Pause
            </button>
            <button
              onclick={() => sendCommand('home')}
              disabled={loading}
              class="py-4 rounded-xl bg-blue-500/20 text-blue-400 text-sm font-medium
                     hover:bg-blue-500/30 disabled:opacity-50 transition-colors flex flex-col items-center gap-1"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              Home
            </button>
          </div>
        </div>

        <!-- Additional Actions -->
        <div>
          <button
            onclick={() => sendCommand('find')}
            disabled={loading}
            class="w-full py-3 rounded-xl bg-zinc-800/60 text-zinc-400 text-sm font-medium
                   hover:bg-zinc-700/60 disabled:opacity-50 transition-colors"
          >
            Find Robot
          </button>
        </div>

        <!-- Fan Speed -->
        <div>
          <p class="text-sm text-[var(--muted)] mb-2">Suction Power</p>
          <div class="grid grid-cols-4 gap-1">
            {#each FAN_MODES as fan}
              <button
                onclick={() => handleFanSpeed(fan.mode)}
                disabled={loading}
                class="py-2 px-1 rounded-lg text-xs font-medium transition-colors
                       {status.fanPower === fan.mode
                         ? 'bg-purple-500/30 text-purple-400 ring-1 ring-purple-500/50'
                         : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'}
                       disabled:opacity-50"
              >
                <div class="text-base mb-0.5">{fan.icon}</div>
                {fan.name}
              </button>
            {/each}
          </div>
        </div>

        <!-- Mop Intensity -->
        <div>
          <p class="text-sm text-[var(--muted)] mb-2">Mop Intensity</p>
          <div class="grid grid-cols-4 gap-1">
            {#each MOP_MODES as mop}
              <button
                onclick={() => handleMopMode(mop.mode)}
                disabled={loading}
                class="py-2 px-1 rounded-lg text-xs font-medium transition-colors
                       {status.waterBoxMode === mop.mode
                         ? 'bg-cyan-500/30 text-cyan-400 ring-1 ring-cyan-500/50'
                         : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'}
                       disabled:opacity-50"
              >
                <div class="text-base mb-0.5">{mop.icon}</div>
                {mop.name}
              </button>
            {/each}
          </div>
        </div>

      {:else if activeTab === 'rooms'}
        <!-- Room Selection -->
        <div>
          <p class="text-sm text-[var(--muted)] mb-2">Select rooms to clean</p>
          {#if rooms.length > 0}
            <div class="grid grid-cols-2 gap-2">
              {#each rooms as room}
                <button
                  onclick={() => toggleRoom(room.segmentId)}
                  class="py-3 px-3 rounded-xl text-sm font-medium transition-colors text-left
                         {selectedRooms.has(room.segmentId)
                           ? 'bg-cyan-500/30 text-cyan-400 ring-1 ring-cyan-500/50'
                           : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'}"
                >
                  {room.name}
                </button>
              {/each}
            </div>
            {#if selectedRooms.size > 0}
              <button
                onclick={cleanSelectedRooms}
                disabled={loading}
                class="w-full mt-3 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm font-medium
                       hover:bg-cyan-500/30 disabled:opacity-50 transition-colors"
              >
                Clean {selectedRooms.size} room{selectedRooms.size > 1 ? 's' : ''}
              </button>
            {/if}
          {:else}
            <p class="text-zinc-500 text-sm">Loading rooms...</p>
          {/if}
        </div>

      {:else if activeTab === 'settings'}
        <!-- Volume -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-[var(--muted)]">Volume</span>
            <span class="text-sm font-medium">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            bind:value={volume}
            onchange={() => handleVolumeChange(volume)}
            class="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        <!-- Consumables -->
        {#if consumables}
          <div>
            <p class="text-sm text-[var(--muted)] mb-3">Consumables</p>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-zinc-400">Main Brush</span>
                  <div class="flex items-center gap-2">
                    <span class="text-zinc-500">{Math.round(consumables.mainBrushWorkTime / 3600)}h</span>
                    <button onclick={() => handleResetConsumable('main_brush_work_time')} disabled={loading} class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-400 disabled:opacity-50">Reset</button>
                  </div>
                </div>
                <div class="h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div class="h-full {getConsumableColor(getConsumablePercent(consumables.mainBrushWorkTime, 300))} transition-all" style="width: {getConsumablePercent(consumables.mainBrushWorkTime, 300)}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-zinc-400">Side Brush</span>
                  <div class="flex items-center gap-2">
                    <span class="text-zinc-500">{Math.round(consumables.sideBrushWorkTime / 3600)}h</span>
                    <button onclick={() => handleResetConsumable('side_brush_work_time')} disabled={loading} class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-400 disabled:opacity-50">Reset</button>
                  </div>
                </div>
                <div class="h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div class="h-full {getConsumableColor(getConsumablePercent(consumables.sideBrushWorkTime, 200))} transition-all" style="width: {getConsumablePercent(consumables.sideBrushWorkTime, 200)}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-zinc-400">Filter</span>
                  <div class="flex items-center gap-2">
                    <span class="text-zinc-500">{Math.round(consumables.filterWorkTime / 3600)}h</span>
                    <button onclick={() => handleResetConsumable('filter_work_time')} disabled={loading} class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-400 disabled:opacity-50">Reset</button>
                  </div>
                </div>
                <div class="h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div class="h-full {getConsumableColor(getConsumablePercent(consumables.filterWorkTime, 150))} transition-all" style="width: {getConsumablePercent(consumables.filterWorkTime, 150)}%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-zinc-400">Sensors</span>
                  <div class="flex items-center gap-2">
                    <span class="text-zinc-500">{Math.round(consumables.sensorDirtyTime / 3600)}h</span>
                    <button onclick={() => handleResetConsumable('sensor_dirty_time')} disabled={loading} class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-400 disabled:opacity-50">Reset</button>
                  </div>
                </div>
                <div class="h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div class="h-full {getConsumableColor(getConsumablePercent(consumables.sensorDirtyTime, 30))} transition-all" style="width: {getConsumablePercent(consumables.sensorDirtyTime, 30)}%"></div>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <p class="text-zinc-500 text-sm">Loading consumables...</p>
        {/if}
      {/if}

      <!-- Device Info -->
      <div class="pt-4 border-t border-[var(--glass-border)] space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-[var(--muted)]">Model</span>
          <span class="font-mono text-xs">Roborock S8</span>
        </div>
      </div>
    {:else}
      <div class="text-center py-8 text-[var(--muted)]">
        Start bridge to control robot
      </div>
    {/if}
  </div>
</DeviceDialog>
