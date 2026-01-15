<script lang="ts">
  import { getToasts, type ToastType } from '$lib/toast.svelte';
  import { Check, X, AlertTriangle, Info } from 'lucide-svelte';

  const toasts = $derived(getToasts());

  function getIcon(type: ToastType) {
    switch (type) {
      case 'success': return Check;
      case 'error': return X;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
    }
  }

  function getColors(type: ToastType) {
    switch (type) {
      case 'success': return 'bg-green-500/20 border-green-500/40 text-green-400';
      case 'error': return 'bg-red-500/20 border-red-500/40 text-red-400';
      case 'warning': return 'bg-amber-500/20 border-amber-500/40 text-amber-400';
      case 'info': return 'bg-blue-500/20 border-blue-500/40 text-blue-400';
    }
  }
</script>

<div class="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
  {#each toasts as toast (toast.id)}
    {@const Icon = getIcon(toast.type)}
    <div
      class="flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg animate-slide-in pointer-events-auto {getColors(toast.type)}"
    >
      <Icon class="w-4 h-4 shrink-0" />
      <span class="text-sm font-medium text-content-primary">{toast.message}</span>
    </div>
  {/each}
</div>

<style>
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.2s ease-out;
  }
</style>
