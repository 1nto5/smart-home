<script lang="ts">
  import type { TuyaDevice } from '$lib/types';
  import { translateDeviceName } from '$lib/translations';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Droplet, DoorOpen, Thermometer, Radio, Tv, Smartphone } from 'lucide-svelte';
  import type { ComponentType } from 'svelte';

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

  const categoryConfig: Record<string, { label: string; icon: ComponentType }> = {
    sj: { label: 'Water', icon: Droplet },
    mcs: { label: 'Door', icon: DoorOpen },
    wsdcg: { label: 'Climate', icon: Thermometer },
    wfcon: { label: 'Gateway', icon: Radio },
    cz: { label: 'Remote', icon: Tv },
  };

  const defaultIcon = Smartphone;

  const LOW_BATTERY_THRESHOLD = 15;

  function getStatusInfo(status: Record<string, any> | null, category: string): { text: string; alert: boolean; color: string; lowBattery: boolean; batteryPercent?: number } {
    if (!status) {
      // Consistent "Monitoring" for sensors without data
      if (category === 'sj' || category === 'mcs') return { text: 'Monitoring', alert: false, color: 'text-content-tertiary', lowBattery: false };
      return { text: 'No data', alert: false, color: 'text-content-tertiary', lowBattery: false };
    }

    switch (category) {
      case 'sj': {
        // Tuya water sensor: '2' or 2 = normal/dry, '1' or 1 or 'alarm' = wet
        const waterValue = status['1'];
        const isWet = waterValue === 'alarm' || waterValue === '1' || waterValue === 1;
        const battery = status['4'];
        const lowBattery = battery !== undefined && battery <= LOW_BATTERY_THRESHOLD;

        if (isWet) {
          return { text: 'Water detected!', alert: true, color: 'text-error', lowBattery, batteryPercent: battery };
        }
        return {
          text: lowBattery ? `Dry · ${battery}%` : 'Dry',
          alert: false,
          color: 'text-success',
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
          color: isOpen ? 'text-warning' : 'text-success',
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
            color: 'text-device-sensors-text',
            lowBattery: false
          };
        }
        return { text: 'N/A', alert: false, color: 'text-content-tertiary', lowBattery: false };
      }
      default:
        return {
          text: device.online ? 'Online' : 'Offline',
          alert: false,
          color: device.online ? 'text-success' : 'text-content-tertiary',
          lowBattery: false
        };
    }
  }

  let config = $derived(categoryConfig[device.category] || { label: device.category, icon: defaultIcon });
  let statusInfo = $derived(getStatusInfo(parsedStatus(), device.category));
</script>

<!-- Card -->
<div
  onclick={() => dialogOpen = true}
  onkeydown={(e) => e.key === 'Enter' && (dialogOpen = true)}
  role="button"
  tabindex="0"
  class="card transition-card hover:scale-[1.02] {compact ? 'p-2.5' : 'p-3'} w-full text-left cursor-pointer
         {statusInfo.lowBattery ? 'border-warning/50 bg-warning/10' : ''}"
>
  <div class="flex items-center gap-2.5">
    <!-- Status icon -->
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
             {statusInfo.alert ? 'bg-error/20 text-error' : statusInfo.lowBattery ? 'bg-warning/20 text-warning' : 'badge-sensors'}"
      class:status-active={statusInfo.alert}
    >
      <svelte:component this={config.icon} class="w-4 h-4" />
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">{displayName}</h4>
      <p class="text-xs {statusInfo.lowBattery ? 'text-warning' : statusInfo.color}">{statusInfo.text}</p>
    </div>

    <!-- Online indicator -->
    <div
      class="w-2 h-2 rounded-full shrink-0
             {device.online ? 'bg-success' : 'bg-content-tertiary'}"
      class:status-dot={device.online}
    ></div>
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title={displayName}>
  <div class="space-y-4">
    <!-- Status Display -->
    <div class="rounded-xl p-6 text-center {statusInfo.alert ? 'bg-error/20' : 'bg-surface-recessed'}">
      <div class="flex justify-center {statusInfo.alert ? 'text-error' : 'text-device-sensors-text'}">
        <svelte:component this={config.icon} class="w-10 h-10" />
      </div>
      <p class="text-2xl font-bold mt-2 {statusInfo.color}">{statusInfo.text}</p>
      <p class="text-sm text-content-secondary mt-1">{config.label} Sensor</p>
    </div>

    <!-- Additional Details for specific sensor types -->
    {#if device.category === 'wsdcg'}
      {@const status = parsedStatus()}
      {#if status}
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-surface-recessed rounded-xl p-4 text-center">
            <span class="text-xs text-content-secondary">Temperature</span>
            <p class="text-2xl font-bold mt-1 text-device-sensors-text">{(status['103'] / 100).toFixed(1)}°C</p>
          </div>
          <div class="bg-surface-recessed rounded-xl p-4 text-center">
            <span class="text-xs text-content-secondary">Humidity</span>
            <p class="text-2xl font-bold mt-1 text-info">{status['102']}%</p>
          </div>
        </div>
      {/if}
    {/if}

    {#if device.category === 'sj' || device.category === 'mcs'}
      {@const status = parsedStatus()}
      {#if status}
        {@const battery = status['4'] || status['103']}
        {#if battery !== undefined}
          <div class="bg-surface-recessed rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-content-secondary">Battery</span>
              <span class="font-bold {battery > 20 ? 'text-success' : 'text-error'}">{battery}%</span>
            </div>
            <div class="mt-2 h-2 bg-stroke-default rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all {battery > 20 ? 'bg-success' : 'bg-error'}"
                style="width: {battery}%"
              ></div>
            </div>
          </div>
        {/if}
      {/if}
    {/if}

    <!-- Device Info -->
    <div class="pt-4 border-t border-stroke-default space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-content-secondary">Type</span>
        <span class="font-medium text-content-primary">{config.label}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-content-secondary">Online</span>
        <span class="{device.online ? 'text-success' : 'text-error'}">{device.online ? 'Yes' : 'No'}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-content-secondary">Device ID</span>
        <span class="font-mono text-xs text-content-tertiary">{device.id.slice(0, 12)}...</span>
      </div>
    </div>
  </div>
</DeviceDialog>
