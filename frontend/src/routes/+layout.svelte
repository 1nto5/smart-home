<script lang="ts">
  import '../app.css';
  import { store } from '$lib/stores.svelte';
  import { theme } from '$lib/theme.svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { Home, House, Thermometer, Lightbulb, Zap } from 'lucide-svelte';
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

<div class="min-h-screen bg-surface-base circuit-bg">
  <!-- Futuristic Header -->
  <header class="sticky top-0 z-40 futuristic-header">
    <nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-3">
      <!-- Logo with glow -->
      <a href="/" class="flex items-center gap-3 group">
        <div class="relative">
          <div class="w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]
                      flex items-center justify-center transition-all duration-300
                      group-hover:shadow-[0_0_20px_var(--color-accent-glow)]">
            <Zap class="w-5 h-5 text-accent" />
          </div>
          <!-- Corner accents -->
          <div class="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-accent rounded-tl-md"></div>
          <div class="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-accent rounded-br-md"></div>
        </div>
        <div class="hidden sm:block">
          <h1 class="font-display text-sm tracking-[0.2em] text-content-primary uppercase">
            Smart Home
          </h1>
          <p class="text-[10px] tracking-[0.3em] text-content-tertiary uppercase">
            Control Center
          </p>
        </div>
      </a>

      <!-- Navigation -->
      <div class="flex items-center gap-1">
        {#each navItems as item, i (item.href)}
          {@const isActive = $page.url.pathname === item.href}
          <a
            href={item.href}
            class="nav-pill flex items-center gap-2 {isActive ? 'nav-pill-active' : 'text-content-secondary hover:text-content-primary hover:bg-surface-recessed'}"
            style="animation-delay: {i * 50}ms"
          >
            <svelte:component this={item.icon} class="w-4 h-4" />
            <span class="hidden sm:inline text-sm">{item.label}</span>
          </a>
        {/each}
      </div>
    </nav>
  </header>

  <!-- Main Content -->
  <main class="relative z-10 max-w-6xl mx-auto px-4 py-6">
    {@render children()}
  </main>

  <!-- Ambient footer glow -->
  <div class="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-0
              bg-gradient-to-t from-[rgba(0,245,255,0.03)] to-transparent"></div>
</div>
