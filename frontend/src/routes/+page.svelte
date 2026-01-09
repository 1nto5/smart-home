<script lang="ts">
  import LampCard from '$lib/components/LampCard.svelte';
  import RoborockCard from '$lib/components/RoborockCard.svelte';
  import TuyaSensorCard from '$lib/components/TuyaSensorCard.svelte';
  import TRVCard from '$lib/components/TRVCard.svelte';
  import YamahaCard from '$lib/components/YamahaCard.svelte';
  import AirPurifierCard from '$lib/components/AirPurifierCard.svelte';
  import { store } from '$lib/stores.svelte';

  // Filter devices by type
  let lamps = $derived(store.lamps.filter(l => l.category === 'lamp'));
  let thermostats = $derived(store.tuyaDevices.filter(d => d.category === 'wkf'));
  let sensors = $derived(store.tuyaDevices.filter(d => ['sj', 'mcs', 'wsdcg'].includes(d.category)));

  // Check if data loaded
  let hasLoaded = $derived(
    store.lamps.length > 0 ||
    store.tuyaDevices.length > 0 ||
    store.yamahaDevices.length > 0
  );
</script>

<svelte:head>
  <title>Smart Home</title>
</svelte:head>

<div class="pb-24 space-y-6">
  <!-- Skeleton loading -->
  {#if store.loading && !hasLoaded}
    <div class="space-y-6">
      {#each Array(3) as _}
        <section>
          <div class="w-20 h-5 rounded bg-zinc-800 animate-pulse mb-3"></div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {#each Array(4) as _}
              <div class="glass-card rounded-xl p-2.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-lg bg-zinc-800 animate-pulse"></div>
                  <div class="flex-1 space-y-1.5">
                    <div class="w-20 h-3.5 rounded bg-zinc-800 animate-pulse"></div>
                    <div class="w-14 h-3 rounded bg-zinc-800 animate-pulse"></div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  {:else}
    <!-- Lights -->
    {#if lamps.length > 0}
      <section>
        <h2 class="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
          <span class="text-amber-400">💡</span> Lights
          <span class="text-xs text-zinc-600">({lamps.length})</span>
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {#each lamps as lamp (lamp.id)}
            <LampCard {lamp} compact />
          {/each}
        </div>
      </section>
    {/if}

    <!-- Climate -->
    {#if thermostats.length > 0 || store.airPurifier}
      <section>
        <h2 class="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
          <span class="text-orange-400">🌡️</span> Climate
          <span class="text-xs text-zinc-600">({thermostats.length + (store.airPurifier ? 1 : 0)})</span>
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {#each thermostats as device (device.id)}
            <TRVCard {device} compact />
          {/each}
          {#if store.airPurifier}
            <AirPurifierCard compact />
          {/if}
        </div>
      </section>
    {/if}

    <!-- Sensors -->
    {#if sensors.length > 0}
      <section>
        <h2 class="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
          <span class="text-cyan-400">📡</span> Sensors
          <span class="text-xs text-zinc-600">({sensors.length})</span>
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {#each sensors as device (device.id)}
            <TuyaSensorCard {device} compact />
          {/each}
        </div>
      </section>
    {/if}

    <!-- Audio -->
    {#if store.yamahaDevices.length > 0}
      <section>
        <h2 class="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
          <span class="text-purple-400">🔊</span> Audio
          <span class="text-xs text-zinc-600">({store.yamahaDevices.length})</span>
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {#each store.yamahaDevices as device (device.id)}
            <YamahaCard {device} compact />
          {/each}
        </div>
      </section>
    {/if}

    <!-- Robot -->
    <section>
      <h2 class="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
        <span class="text-green-400">🤖</span> Robot
        <span class="text-xs text-zinc-600">(1)</span>
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        <RoborockCard status={store.roborock} compact />
      </div>
    </section>
  {/if}
</div>
