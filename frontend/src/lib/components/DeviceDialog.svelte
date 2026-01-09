<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    open = false,
    onclose,
    title,
    children
  }: {
    open: boolean;
    onclose: () => void;
    title: string;
    children: Snippet;
  } = $props();

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onclose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onclose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    tabindex="-1"
  >
    <!-- Dialog -->
    <div class="glass-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-[var(--glass-border)]">
        <h2 id="dialog-title" class="text-lg font-semibold">{title}</h2>
        <button
          onclick={onclose}
          aria-label="Close dialog"
          class="w-8 h-8 rounded-lg bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-colors flex items-center justify-center"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-4 overflow-y-auto max-h-[calc(80vh-64px)]">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .animate-fade-in {
    animation: fade-in 0.15s ease-out;
  }
</style>
