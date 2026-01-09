<script lang="ts">
  import type { TuyaDevice } from '$lib/types';
  import { translateDeviceName } from '$lib/translations';
  import DeviceDialog from './DeviceDialog.svelte';

  let { device, compact = false }: { device: TuyaDevice; compact?: boolean } = $props();
  let displayName = $derived(translateDeviceName(device.name));
  let dialogOpen = $state(false);

  let parsedStatus = $derived(() => {
    if (!device.last_status) return null;
    try {
      return JSON.parse(device.last_status);
    } catch {
      return null;
    }
  });

  const categoryConfig: Record<string, { label: string; icon: string }> = {
    sj: { label: 'Water', icon: '💧' },
    mcs: { label: 'Door', icon: '🚪' },
    wsdcg: { label: 'Climate', icon: '🌡️' },
    wfcon: { label: 'Gateway', icon: '📡' },
    cz: { label: 'Remote', icon: '📺' },
  };

  const LOW_BATTERY_THRESHOLD = 15;

  function getStatusInfo(status: Record<string, any> | null, category: string): { text: string; alert: boolean; color: string; lowBattery: boolean; batteryPercent?: number } {
    if (!status) {
      // Consistent "Monitoring" for sensors without data
      if (category === 'sj' || category === 'mcs') return { text: 'Monitoring', alert: false, color: 'text-zinc-500', lowBattery: false };
      return { text: 'No data', alert: false, color: 'text-zinc-500', lowBattery: false };
    }

    switch (category) {
      case 'sj': {
        // Tuya water sensor: '2' or 2 = normal/dry, '1' or 1 or 'alarm' = wet
        const waterValue = status['1'];
        const isWet = waterValue === 'alarm' || waterValue === '1' || waterValue === 1;
        const battery = status['4'];
        const lowBattery = battery !== undefined && battery <= LOW_BATTERY_THRESHOLD;

        if (isWet) {
          return { text: 'Water detected!', alert: true, color: 'text-red-400', lowBattery, batteryPercent: battery };
        }
        return {
          text: lowBattery ? `Dry · ${battery}%` : 'Dry',
          alert: false,
          color: 'text-green-400',
          lowBattery,
          batteryPercent: battery
        };
      }
      case 'mcs': {
        const isOpen = status['101'] === true || status['1'] === true;
        const battery = status['103'] || status['4'];
        const lowBattery = battery !== undefined && battery <= LOW_BATTERY_THRESHOLD;
        return {
          text: lowBattery ? `${isOpen ? 'Open' : 'Closed'} · ${battery}%` : (isOpen ? 'Open' : 'Closed'),
          alert: isOpen,
          color: isOpen ? 'text-amber-400' : 'text-green-400',
          lowBattery,
          batteryPercent: battery
        };
      }
      case 'wsdcg': {
        const temp = status['103'];
        const humidity = status['102'];
        if (temp !== undefined && humidity !== undefined) {
          return {
            text: `${(temp / 100).toFixed(1)}°C · ${humidity}%`,
            alert: false,
            color: 'text-cyan-400',
            lowBattery: false
          };
        }
        return { text: 'N/A', alert: false, color: 'text-zinc-500', lowBattery: false };
      }
      default:
        return {
          text: device.online ? 'Online' : 'Offline',
          alert: false,
          color: device.online ? 'text-green-400' : 'text-zinc-500',
          lowBattery: false
        };
    }
  }

  let config = $derived(categoryConfig[device.category] || { label: device.category, icon: '📱' });
  let statusInfo = $derived(getStatusInfo(parsedStatus(), device.category));
</script>

<!-- Card -->
<div
  onclick={() => dialogOpen = true}
  onkeydown={(e) => e.key === 'Enter' && (dialogOpen = true)}
  role="button"
  tabindex="0"
  class="glass-card rounded-xl transition-card hover:scale-[1.02] {compact ? 'p-2.5' : 'p-3'} w-full text-left cursor-pointer
         {statusInfo.lowBattery ? 'border-amber-500/50 bg-amber-500/10' : ''}"
>
  <div class="flex items-center gap-2.5">
    <!-- Status icon -->
    <div
      class="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0
             {statusInfo.alert ? 'bg-red-500/20' : statusInfo.lowBattery ? 'bg-amber-500/20' : 'bg-zinc-800/60'}"
      class:status-active={statusInfo.alert}
    >
      {config.icon}
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm truncate">{displayName}</h4>
      <p class="text-xs {statusInfo.lowBattery ? 'text-amber-400' : statusInfo.color}">{statusInfo.text}</p>
    </div>

    <!-- Online indicator -->
    <div
      class="w-2 h-2 rounded-full shrink-0
             {device.online ? 'bg-green-500' : 'bg-zinc-600'}"
      class:status-dot={device.online}
    ></div>
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title={displayName}>
  <div class="space-y-4">
    <!-- Status Display -->
    <div class="rounded-xl p-6 text-center {statusInfo.alert ? 'bg-red-500/20' : 'bg-zinc-800/40'}">
      <span class="text-4xl">{config.icon}</span>
      <p class="text-2xl font-bold mt-2 {statusInfo.color}">{statusInfo.text}</p>
      <p class="text-sm text-[var(--muted)] mt-1">{config.label} Sensor</p>
    </div>

    <!-- Additional Details for specific sensor types -->
    {#if device.category === 'wsdcg'}
      {@const status = parsedStatus()}
      {#if status}
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-zinc-800/40 rounded-xl p-4 text-center">
            <span class="text-xs text-[var(--muted)]">Temperature</span>
            <p class="text-2xl font-bold mt-1 text-cyan-400">{(status['103'] / 100).toFixed(1)}°C</p>
          </div>
          <div class="bg-zinc-800/40 rounded-xl p-4 text-center">
            <span class="text-xs text-[var(--muted)]">Humidity</span>
            <p class="text-2xl font-bold mt-1 text-blue-400">{status['102']}%</p>
          </div>
        </div>
      {/if}
    {/if}

    {#if device.category === 'sj' || device.category === 'mcs'}
      {@const status = parsedStatus()}
      {#if status}
        {@const battery = status['4'] || status['103']}
        {#if battery !== undefined}
          <div class="bg-zinc-800/40 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-[var(--muted)]">Battery</span>
              <span class="font-bold {battery > 20 ? 'text-green-400' : 'text-red-400'}">{battery}%</span>
            </div>
            <div class="mt-2 h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all {battery > 20 ? 'bg-green-500' : 'bg-red-500'}"
                style="width: {battery}%"
              ></div>
            </div>
          </div>
        {/if}
      {/if}
    {/if}

    <!-- Device Info -->
    <div class="pt-4 border-t border-[var(--glass-border)] space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-[var(--muted)]">Type</span>
        <span class="font-medium">{config.label}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-[var(--muted)]">Online</span>
        <span class="{device.online ? 'text-green-400' : 'text-red-400'}">{device.online ? 'Yes' : 'No'}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-[var(--muted)]">Device ID</span>
        <span class="font-mono text-xs">{device.id.slice(0, 12)}...</span>
      </div>
    </div>
  </div>
</DeviceDialog>
