<script lang="ts">
  import LampCard from '$lib/components/LampCard.svelte';
  import RoborockCard from '$lib/components/RoborockCard.svelte';
  import TuyaSensorCard from '$lib/components/TuyaSensorCard.svelte';
  import TRVCard from '$lib/components/TRVCard.svelte';
  import YamahaCard from '$lib/components/YamahaCard.svelte';
  import AirPurifierCard from '$lib/components/AirPurifierCard.svelte';
  import HomeStatusCard from '$lib/components/HomeStatusCard.svelte';
  import { store } from '$lib/stores.svelte';
  import { Lightbulb, Thermometer, Radio, Zap } from 'lucide-svelte';

  // Filter devices by type
  let lamps = $derived(store.lamps.filter(l => l.category === 'lamp'));
  let thermostats = $derived(store.tuyaDevices.filter(d => d.category === 'wkf'));
  // Sensors excluding weather station (shown in quick access)
  let sensors = $derived(store.tuyaDevices.filter(d => ['sj', 'mcs'].includes(d.category)));
  // Weather station for quick access
  let weatherStation = $derived(store.tuyaDevices.find(d => d.category === 'wsdcg'));

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

<div class="pb-24 space-y-8">
  <!-- Skeleton loading with scan effect -->
  {#if store.loading && !hasLoaded}
    <div class="space-y-8">
      {#each Array(4) as _, i}
        <section class="relative" style="animation-delay: {i * 100}ms">
          <!-- Section header skeleton -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-lg bg-surface-elevated skeleton-glow"></div>
            <div class="w-24 h-5 rounded bg-surface-elevated skeleton-glow"></div>
            <div class="flex-1 h-px bg-gradient-to-r from-stroke-subtle to-transparent"></div>
          </div>
          <!-- Card grid skeleton -->
          <div class="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {#each Array(4) as _, j}
              <div class="card p-3 relative overflow-hidden" style="animation-delay: {(i * 4 + j) * 50}ms">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-surface-recessed skeleton-glow"></div>
                  <div class="flex-1 space-y-2">
                    <div class="w-20 h-3.5 rounded bg-surface-recessed skeleton-glow"></div>
                    <div class="w-14 h-3 rounded bg-surface-recessed skeleton-glow"></div>
                  </div>
                </div>
                <!-- Scan line effect -->
                <div class="absolute inset-0 scan-line-overlay"></div>
              </div>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  {:else}
    <!-- Home Status -->
    <HomeStatusCard />

    <!-- Quick Access: Soundbar, Roborock, Air Purifier, Weather Station -->
    <section>
      <div class="section-header section-header-quick">
        <div class="section-icon glow-accent">
          <Zap class="w-4 h-4" />
        </div>
        <h2 class="section-title">Quick Access</h2>
        <div class="section-line"></div>
      </div>
      <div class="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-3">
        {#each store.yamahaDevices as device (device.id)}
          <YamahaCard {device} compact />
        {/each}
        <RoborockCard status={store.roborock} compact />
        {#if store.airPurifier}
          <AirPurifierCard compact />
        {/if}
        {#if weatherStation}
          <TuyaSensorCard device={weatherStation} compact />
        {/if}
      </div>
    </section>

    <!-- Lights -->
    {#if lamps.length > 0}
      <section>
        <div class="section-header section-header-lights">
          <div class="section-icon glow-lights">
            <Lightbulb class="w-4 h-4" />
          </div>
          <h2 class="section-title">Lights</h2>
          <span class="section-count">{lamps.length}</span>
          <div class="section-line"></div>
        </div>
        <div class="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {#each lamps as lamp (lamp.id)}
            <LampCard {lamp} compact />
          {/each}
        </div>
      </section>
    {/if}

    <!-- Climate (Thermostats only) -->
    {#if thermostats.length > 0}
      <section>
        <div class="section-header section-header-climate">
          <div class="section-icon glow-climate-heat">
            <Thermometer class="w-4 h-4" />
          </div>
          <h2 class="section-title">Climate</h2>
          <span class="section-count">{thermostats.length}</span>
          <div class="section-line"></div>
        </div>
        <div class="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {#each thermostats as device (device.id)}
            <TRVCard {device} compact />
          {/each}
        </div>
      </section>
    {/if}

    <!-- Sensors -->
    {#if sensors.length > 0}
      <section>
        <div class="section-header section-header-sensors">
          <div class="section-icon glow-sensors">
            <Radio class="w-4 h-4" />
          </div>
          <h2 class="section-title">Sensors</h2>
          <span class="section-count">{sensors.length}</span>
          <div class="section-line"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {#each sensors as device (device.id)}
            <TuyaSensorCard {device} compact />
          {/each}
        </div>
      </section>
    {/if}
  {/if}
</div>

<style>
  /* Section header base */
  .section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .section-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-content-secondary);
  }

  .section-count {
    font-family: var(--font-display);
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    background: var(--color-surface-elevated);
    color: var(--color-content-tertiary);
    border: 1px solid var(--color-stroke-subtle);
  }

  .section-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--color-stroke-subtle) 0%, transparent 100%);
  }

  /* Category-specific accents */
  .section-header-lights .section-icon {
    background: color-mix(in srgb, var(--color-lights-text) 15%, transparent);
    border-color: color-mix(in srgb, var(--color-lights-text) 30%, transparent);
    color: var(--color-lights-text);
  }
  .section-header-lights .section-title { color: var(--color-lights-text); }
  .section-header-lights .section-line {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-lights-text) 40%, transparent) 0%, transparent 100%);
  }

  .section-header-climate .section-icon {
    background: color-mix(in srgb, var(--color-climate-heat-text) 15%, transparent);
    border-color: color-mix(in srgb, var(--color-climate-heat-text) 30%, transparent);
    color: var(--color-climate-heat-text);
  }
  .section-header-climate .section-title { color: var(--color-climate-heat-text); }
  .section-header-climate .section-line {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-climate-heat-text) 40%, transparent) 0%, transparent 100%);
  }

  .section-header-sensors .section-icon {
    background: color-mix(in srgb, var(--color-sensors-text) 15%, transparent);
    border-color: color-mix(in srgb, var(--color-sensors-text) 30%, transparent);
    color: var(--color-sensors-text);
  }
  .section-header-sensors .section-title { color: var(--color-sensors-text); }
  .section-header-sensors .section-line {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-sensors-text) 40%, transparent) 0%, transparent 100%);
  }

  .section-header-audio .section-icon {
    background: color-mix(in srgb, var(--color-audio-text) 15%, transparent);
    border-color: color-mix(in srgb, var(--color-audio-text) 30%, transparent);
    color: var(--color-audio-text);
  }
  .section-header-audio .section-title { color: var(--color-audio-text); }
  .section-header-audio .section-line {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-audio-text) 40%, transparent) 0%, transparent 100%);
  }

  .section-header-robot .section-icon {
    background: color-mix(in srgb, var(--color-robot-text) 15%, transparent);
    border-color: color-mix(in srgb, var(--color-robot-text) 30%, transparent);
    color: var(--color-robot-text);
  }
  .section-header-robot .section-title { color: var(--color-robot-text); }
  .section-header-robot .section-line {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-robot-text) 40%, transparent) 0%, transparent 100%);
  }

  .section-header-quick .section-icon {
    background: color-mix(in srgb, var(--color-accent) 15%, transparent);
    border-color: color-mix(in srgb, var(--color-accent) 30%, transparent);
    color: var(--color-accent);
  }
  .section-header-quick .section-title { color: var(--color-accent); }
  .section-header-quick .section-line {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 40%, transparent) 0%, transparent 100%);
  }

  /* Skeleton loading effects */
  .skeleton-glow {
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  @keyframes skeleton-pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }

  .scan-line-overlay {
    background: linear-gradient(
      180deg,
      transparent 0%,
      color-mix(in srgb, var(--color-accent) 10%, transparent) 50%,
      transparent 100%
    );
    animation: scan-down 2s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes scan-down {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }
</style>
