<script lang="ts">
  import type { TuyaDevice } from '$lib/types';
  import { translateDeviceName } from '$lib/translations';
  import DeviceDialog from './DeviceDialog.svelte';
  import { Droplet, DoorOpen, Thermometer, Radio, Tv, Smartphone, AlertTriangle, Battery } from 'lucide-svelte';
  import type { ComponentType } from 'svelte';

  let { device, compact = false }: { device: TuyaDevice; compact?: boolean } = $props();
  let displayName = $derived(translateDeviceName(device.name));
  let dialogOpen = $state(false);

  let parsedStatus = $derived(() => {
    if (!device.last_status) return null;
    try { return JSON.parse(device.last_status); }
    catch { return null; }
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
      if (category === 'sj' || category === 'mcs') return { text: 'Monitoring', alert: false, color: 'text-content-tertiary', lowBattery: false };
      return { text: 'No data', alert: false, color: 'text-content-tertiary', lowBattery: false };
    }

    switch (category) {
      case 'sj': {
        const waterValue = status['1'];
        const isWet = waterValue === 'alarm' || waterValue === '1' || waterValue === 1;
        const battery = status['4'];
        const lowBattery = battery !== undefined && battery <= LOW_BATTERY_THRESHOLD;
        if (isWet) return { text: 'Water detected!', alert: true, color: 'text-error', lowBattery, batteryPercent: battery };
        return { text: lowBattery ? `Dry · ${battery}%` : 'Dry', alert: false, color: 'text-success', lowBattery, batteryPercent: battery };
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
        const humidity = status['101'];
        const battery = status['102'];
        const lowBattery = battery !== undefined && battery <= LOW_BATTERY_THRESHOLD;
        if (temp !== undefined && humidity !== undefined) {
          const humidityVal = (humidity / 100).toFixed(1);
          return { text: `${(temp / 100).toFixed(1)}°C · ${humidityVal}%`, alert: false, color: 'text-device-sensors-text', lowBattery, batteryPercent: battery };
        }
        return { text: 'N/A', alert: false, color: 'text-content-tertiary', lowBattery: false };
      }
      default:
        return { text: device.online ? 'Online' : 'Offline', alert: false, color: device.online ? 'text-success' : 'text-content-tertiary', lowBattery: false };
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
  class="card {compact ? 'p-3' : 'p-4'} w-full text-left cursor-pointer
         {statusInfo.alert ? 'card-active border-error/50' : statusInfo.lowBattery ? 'border-warning/50' : ''}"
>
  <div class="flex items-center gap-3">
    <!-- Status icon -->
    <div
      class="power-btn {statusInfo.alert ? 'bg-error/20 text-error border-error/50' : statusInfo.lowBattery ? 'bg-warning/20 text-warning border-warning/50' : 'glow-sensors power-btn-on'}"
      class:animate-glow={statusInfo.alert}
    >
      <svelte:component this={config.icon} class="w-4 h-4" />
    </div>

    <!-- Info -->
    <div class="min-w-0 flex-1">
      <h4 class="font-medium text-sm text-content-primary truncate">{displayName}</h4>
      <p class="text-xs {statusInfo.lowBattery ? 'text-warning' : statusInfo.color} {statusInfo.alert ? 'neon-text-subtle' : ''}">{statusInfo.text}</p>
    </div>

    <!-- Online indicator -->
    <div class="w-2 h-2 rounded-full shrink-0 {device.online ? 'bg-success animate-glow' : 'bg-content-tertiary'}"></div>
  </div>
</div>

<!-- Detail Dialog -->
<DeviceDialog open={dialogOpen} onclose={() => dialogOpen = false} title={displayName}>
  <div class="space-y-5">
    <!-- Status Display -->
    <div class="rounded-xl p-6 text-center {statusInfo.alert ? 'bg-error/10 border border-error/30' : 'bg-surface-recessed border border-stroke-subtle'}">
      <div class="flex justify-center {statusInfo.alert ? 'text-error' : 'text-device-sensors-text'}">
        {#if statusInfo.alert}
          <AlertTriangle class="w-12 h-12 animate-glow" />
        {:else}
          <svelte:component this={config.icon} class="w-12 h-12" />
        {/if}
      </div>
      <p class="font-display text-2xl mt-3 {statusInfo.color} {statusInfo.alert ? 'neon-text' : ''}">{statusInfo.text}</p>
      <p class="text-sm text-content-tertiary mt-1 uppercase tracking-wider">{config.label} Sensor</p>
    </div>

    <!-- Climate sensor details -->
    {#if device.category === 'wsdcg'}
      {@const status = parsedStatus()}
      {#if status}
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-xl p-4 text-center bg-surface-recessed border border-stroke-subtle">
            <span class="text-xs text-content-tertiary uppercase tracking-wider">Temperature</span>
            <p class="font-display text-2xl mt-2 text-device-sensors-text neon-text-subtle">{(status['103'] / 100).toFixed(1)}°C</p>
          </div>
          <div class="rounded-xl p-4 text-center bg-surface-recessed border border-stroke-subtle">
            <span class="text-xs text-content-tertiary uppercase tracking-wider">Humidity</span>
            <p class="font-display text-2xl mt-2 text-accent neon-text-subtle">{status['102']}%</p>
          </div>
        </div>
      {/if}
    {/if}

    <!-- Battery status -->
    {#if device.category === 'sj' || device.category === 'mcs'}
      {@const status = parsedStatus()}
      {#if status}
        {@const battery = status['4'] || status['103']}
        {#if battery !== undefined}
          <div class="rounded-xl p-4 bg-surface-recessed border border-stroke-subtle">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs text-content-tertiary uppercase tracking-wider flex items-center gap-2">
                <Battery class="w-4 h-4" />
                Battery
              </span>
              <span class="font-display text-lg {battery > 20 ? 'text-success' : 'text-error'}">{battery}%</span>
            </div>
            <div class="h-2 bg-[var(--color-bg-base)] rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all {battery > 20 ? 'bg-success' : 'bg-error'} {battery > 20 ? '' : 'animate-glow'}"
                style="width: {battery}%"
              ></div>
            </div>
          </div>
        {/if}
      {/if}
    {/if}

    <!-- Device Info -->
    <div class="pt-4 border-t border-stroke-subtle space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-xs text-content-tertiary uppercase tracking-wider">Type</span>
        <span class="text-sm font-medium text-content-primary">{config.label}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-xs text-content-tertiary uppercase tracking-wider">Online</span>
        <span class="text-xs {device.online ? 'text-success' : 'text-error'}">{device.online ? 'Connected' : 'Offline'}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-xs text-content-tertiary uppercase tracking-wider">Device ID</span>
        <span class="font-mono text-xs text-accent px-2 py-1 rounded bg-accent/10">{device.id.slice(0, 12)}...</span>
      </div>
    </div>
  </div>
</DeviceDialog>
