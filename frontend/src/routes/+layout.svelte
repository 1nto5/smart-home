<script lang="ts">
  import '../app.css';
  import { store } from '$lib/stores.svelte';
  import { theme } from '$lib/theme.svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { Home, Thermometer, Lightbulb, Zap, Sun, Moon, Monitor, Shield, ShieldOff, RefreshCw, Workflow } from 'lucide-svelte';
  import type { ComponentType } from 'svelte';
  import { getAlarmStatus, armAlarm, disarmAlarm } from '$lib/api';

  let { children } = $props();

  let alarmArmed = $state(false);
  let alarmLoading = $state(false);
  let isRefreshing = $state(false);

  async function handleRefresh() {
    isRefreshing = true;
    await store.refreshAll();
    await loadAlarmStatus();
    setTimeout(() => isRefreshing = false, 500);
  }

  async function loadAlarmStatus() {
    try {
      const status = await getAlarmStatus();
      alarmArmed = status.armed;
    } catch (e) {
      console.error('Failed to load alarm status:', e);
    }
  }

  async function toggleAlarm() {
    alarmLoading = true;
    try {
      if (alarmArmed) {
        const status = await disarmAlarm();
        alarmArmed = status.armed;
      } else {
        const status = await armAlarm();
        alarmArmed = status.armed;
      }
    } catch (e) {
      console.error('Failed to toggle alarm:', e);
    } finally {
      alarmLoading = false;
    }
  }

  $effect(() => {
    if (browser) {
      theme.init();
      store.initWebSocket();
      store.refreshAll();
      loadAlarmStatus();
      const interval = setInterval(() => store.refreshAll(), 30000);
      return () => clearInterval(interval);
    }
  });

  const navItems: { href: string; label: string; icon: ComponentType }[] = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/lighting', label: 'Lighting', icon: Lightbulb },
    { href: '/heater-schedule', label: 'Climate', icon: Thermometer },
    { href: '/automations', label: 'Automations', icon: Zap },
  ];
</script>

<div class="min-h-screen bg-surface-base">
  <!-- Header -->
  <header class="sticky top-0 z-40 app-header">
    <nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-3">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]
                    flex items-center justify-center transition-all duration-200">
          <Zap class="w-5 h-5 text-accent" />
        </div>
        <div class="hidden sm:block">
          <h1 class="font-display text-sm text-content-primary">
            Smart Home
          </h1>
          <p class="text-xs text-content-tertiary">
            Control Center
          </p>
        </div>
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-1">
        {#each navItems as item (item.href)}
          {@const isActive = $page.url.pathname === item.href}
          <a
            href={item.href}
            class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                   {isActive ? 'bg-[var(--color-accent-subtle)] text-accent' : 'text-content-secondary hover:text-content-primary hover:bg-surface-recessed'}"
          >
            <svelte:component this={item.icon} class="w-4 h-4" />
            <span class="text-sm font-medium">{item.label}</span>
          </a>
        {/each}
      </div>

      <!-- Utility Buttons -->
      <div class="flex items-center gap-1">
        <!-- Refresh Button -->
        <button
          onclick={handleRefresh}
          disabled={isRefreshing}
          class="ml-2 p-2 rounded-lg transition-all duration-200 text-content-secondary hover:text-content-primary hover:bg-surface-recessed"
          title="Odśwież"
        >
          <RefreshCw class="w-4 h-4 {isRefreshing ? 'animate-spin' : ''}" />
        </button>

        <!-- Alarm Toggle -->
        <button
          onclick={toggleAlarm}
          disabled={alarmLoading}
          class="p-2 rounded-lg transition-all duration-200 {alarmArmed
            ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
            : 'text-content-secondary hover:text-content-primary hover:bg-surface-recessed'}"
          title={alarmArmed ? 'Alarm ARMED - click to disarm' : 'Alarm disarmed - click to arm'}
        >
          {#if alarmArmed}
            <Shield class="w-4 h-4" />
          {:else}
            <ShieldOff class="w-4 h-4" />
          {/if}
        </button>

        <!-- Theme Toggle -->
        <button
          onclick={() => theme.toggle()}
          class="theme-toggle ml-1"
          title="Toggle theme ({theme.mode})"
        >
          {#if theme.mode === 'system'}
            <Monitor class="w-4 h-4" />
          {:else if theme.isDark}
            <Moon class="w-4 h-4" />
          {:else}
            <Sun class="w-4 h-4" />
          {/if}
        </button>
      </div>
    </nav>
  </header>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
    {@render children()}
  </main>

  <!-- Bottom Tab Bar (mobile only) -->
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-surface-elevated border-t border-stroke-subtle pb-safe md:hidden">
    <div class="flex justify-around max-w-lg mx-auto px-2 py-1.5">
      {#each navItems as item (item.href)}
        {@const isActive = $page.url.pathname === item.href}
        <a
          href={item.href}
          class="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors
                 {isActive ? 'text-accent' : 'text-content-tertiary hover:text-content-secondary'}"
        >
          <svelte:component this={item.icon} class="w-5 h-5" />
          <span class="text-[10px] font-medium">{item.label}</span>
        </a>
      {/each}
    </div>
  </nav>
</div>
