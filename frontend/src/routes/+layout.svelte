<script lang="ts">
  import '../app.css';
  import { store } from '$lib/stores.svelte';
  import { theme } from '$lib/theme.svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { Home, Thermometer, Lightbulb, Zap, Sun, Moon, Monitor } from 'lucide-svelte';
  import type { ComponentType } from 'svelte';

  let { children } = $props();

  $effect(() => {
    if (browser) {
      theme.init();
      store.initWebSocket();
      store.refreshAll();
      const interval = setInterval(() => store.refreshAll(), 30000);
      return () => clearInterval(interval);
    }
  });

  const navItems: { href: string; label: string; icon: ComponentType }[] = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/lighting', label: 'Lighting', icon: Lightbulb },
    { href: '/heater-schedule', label: 'Climate', icon: Thermometer },
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

      <!-- Navigation + Theme Toggle -->
      <div class="flex items-center gap-1">
        {#each navItems as item (item.href)}
          {@const isActive = $page.url.pathname === item.href}
          <a
            href={item.href}
            class="nav-pill flex items-center gap-2 {isActive ? 'nav-pill-active' : 'text-content-secondary hover:text-content-primary hover:bg-surface-recessed'}"
          >
            <svelte:component this={item.icon} class="w-4 h-4" />
            <span class="hidden sm:inline text-sm">{item.label}</span>
          </a>
        {/each}

        <!-- Theme Toggle -->
        <button
          onclick={() => theme.toggle()}
          class="theme-toggle ml-2"
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
  <main class="max-w-6xl mx-auto px-4 py-6">
    {@render children()}
  </main>
</div>
