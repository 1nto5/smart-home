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

  $effect(() => {
    if (open) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <!-- Backdrop with blur -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 dialog-overlay"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    tabindex="-1"
  >
    <!-- Dialog panel -->
    <div class="dialog-content w-full max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[85vh] overflow-hidden animate-dialog-in">
      <!-- Header with glow line -->
      <div class="relative px-5 py-4 border-b border-stroke-default">
        <!-- Header glow accent -->
        <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent-glow)] to-transparent"></div>

        <div class="flex items-center justify-between">
          <h2 id="dialog-title" class="font-display text-base tracking-[0.1em] text-content-primary uppercase">
            {title}
          </h2>
          <button
            onclick={onclose}
            aria-label="Close dialog"
            class="w-10 h-10 rounded-lg bg-surface-recessed border border-stroke-default
                   text-content-secondary hover:text-error hover:border-error hover:bg-[rgba(255,71,87,0.1)]
                   transition-all duration-300 flex items-center justify-center
                   hover:shadow-[0_0_15px_rgba(255,71,87,0.3)]"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Content area with subtle grid -->
      <div class="relative p-5 overflow-y-auto max-h-[calc(85vh-80px)]">
        <!-- Subtle grid pattern -->
        <div class="absolute inset-0 opacity-[0.02] pointer-events-none"
             style="background-image: linear-gradient(var(--color-accent) 1px, transparent 1px),
                    linear-gradient(90deg, var(--color-accent) 1px, transparent 1px);
                    background-size: 30px 30px;">
        </div>
        <div class="relative z-10">
          {@render children()}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes dialog-in {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
      filter: brightness(1.5);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
      filter: brightness(1);
    }
  }

  .animate-dialog-in {
    animation: dialog-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .dialog-overlay {
    animation: fade-in 0.2s ease-out;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
