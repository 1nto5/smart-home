<script lang="ts">
  import '../app.css';
  import { store } from '$lib/stores.svelte';
  import { theme } from '$lib/theme.svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  let { children } = $props();

  $effect(() => {
    if (browser) {
      theme.init();
      store.refreshAll();
      const interval = setInterval(() => store.refreshAll(), 10000);
      return () => clearInterval(interval);
    }
  });

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/presets', label: 'Presets', icon: '🎨' },
    { href: '/schedule', label: 'Schedule', icon: '📅' },
  ];

  const themeIcons = {
    system: '🌓',
    light: '☀️',
    dark: '🌙'
  };
</script>

<div class="min-h-screen bg-surface-base transition-colors duration-200">
  <!-- Header -->
  <header class="sticky top-0 z-40 bg-surface-elevated border-b border-stroke-default">
    <nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-2.5">
      <h1 class="text-base font-semibold text-content-primary flex items-center gap-2">
        <span class="text-lg">🏡</span>
        <span class="hidden sm:inline">Smart Home</span>
      </h1>

      <div class="flex items-center gap-2">
        <!-- Navigation -->
        <div class="flex gap-1">
          {#each navItems as item (item.href)}
            <a
              href={item.href}
              class="px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5
                     {$page.url.pathname === item.href
                       ? 'bg-accent/15 text-accent'
                       : 'text-content-secondary hover:text-content-primary hover:bg-surface-recessed'}"
            >
              <span class="text-sm">{item.icon}</span>
              <span class="hidden sm:inline">{item.label}</span>
            </a>
          {/each}
        </div>

        <!-- Theme Toggle -->
        <button
          onclick={() => theme.toggle()}
          class="ml-2 p-2 rounded-lg text-content-secondary hover:text-content-primary
                 hover:bg-surface-recessed transition-colors min-h-[44px] min-w-[44px]
                 flex items-center justify-center"
          title="Theme: {theme.mode}"
        >
          <span class="text-lg">{themeIcons[theme.mode]}</span>
        </button>
      </div>
    </nav>
  </header>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto px-4 py-4">
    {@render children()}
  </main>
</div>
