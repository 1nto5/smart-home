<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from 'lucide-svelte';

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
    class="fixed inset-0 z-50 flex items-center justify-center p-4 dialog-overlay animate-fade-in"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    tabindex="-1"
  >
    <!-- Dialog -->
    <div class="dialog-content w-full max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-stroke-default">
        <h2 id="dialog-title" class="text-lg font-semibold text-content-primary">{title}</h2>
        <button
          onclick={onclose}
          aria-label="Close dialog"
          class="w-10 h-10 rounded-xl bg-surface-recessed text-content-secondary hover:text-content-primary
                 hover:bg-stroke-default transition-colors flex items-center justify-center"
        >
          <X class="w-5 h-5" />
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
