<script lang="ts">
  import '../app.css';
  import { store } from '$lib/stores.svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  let { children } = $props();

  $effect(() => {
    if (browser) {
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
</script>

<div class="min-h-screen bg-[var(--bg)]">
  <!-- Glass header -->
  <header class="sticky top-0 z-40 glass-card border-b border-[var(--glass-border)]">
    <nav class="flex items-center justify-between max-w-6xl mx-auto px-4 py-2.5">
      <h1 class="text-base font-semibold flex items-center gap-2">
        <span class="text-lg">🏡</span>
        <span class="hidden sm:inline">Smart Home</span>
      </h1>

      <div class="flex gap-1">
        {#each navItems as item (item.href)}
          <a
            href={item.href}
            class="px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5
                   {$page.url.pathname === item.href
                     ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                     : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5'}"
          >
            <span class="text-sm">{item.icon}</span>
            <span class="hidden sm:inline">{item.label}</span>
          </a>
        {/each}
      </div>
    </nav>
  </header>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto px-4 py-4">
    {@render children()}
  </main>
</div>
