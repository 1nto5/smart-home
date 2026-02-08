<script lang="ts">
  import { getToasts, type ToastType } from '$lib/toast.svelte';
  import { Check, X, AlertTriangle, Info, Loader2 } from 'lucide-svelte';

  const toasts = $derived(getToasts());

  function getIcon(type: ToastType) {
    switch (type) {
      case 'success': return Check;
      case 'error': return X;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'loading': return Loader2;
    }
  }

  function getColors(type: ToastType) {
    switch (type) {
      case 'success': return 'bg-green-500/20 border-green-500/40 text-green-400';
      case 'error': return 'bg-red-500/20 border-red-500/40 text-red-400';
      case 'warning': return 'bg-amber-500/20 border-amber-500/40 text-amber-400';
      case 'info': return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
      case 'loading': return 'bg-accent/20 border-accent/40 text-accent';
    }
  }
</script>

<div
  role="region"
  aria-live="polite"
  aria-label="Notifications"
  class="fixed top-0 left-0 right-0 p-3 md:top-4 md:left-auto md:right-4 md:p-0 z-50 flex flex-col gap-2 items-center md:items-end pointer-events-none"
>
  {#each toasts as toast (toast.id)}
    {@const Icon = getIcon(toast.type)}
    <div
      role="alert"
      class="flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg animate-slide-in pointer-events-auto {getColors(toast.type)}"
    >
      <Icon class="w-4 h-4 shrink-0 {toast.type === 'loading' ? 'animate-spin' : ''}" aria-hidden="true" />
      <span class="text-sm font-medium text-content-primary">{toast.message}</span>
    </div>
  {/each}
</div>

<style>
  @keyframes slide-down {
    from {
      transform: translateY(-1rem);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  @keyframes slide-up {
    from {
      transform: translateY(1rem);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-down 0.2s ease-out;
  }
  @media (min-width: 768px) {
    .animate-slide-in {
      animation: slide-up 0.2s ease-out;
    }
  }
</style>
