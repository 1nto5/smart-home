<script lang="ts">
  import { Power } from 'lucide-svelte';

  let {
    isOn,
    isPending,
    onclick,
    glowClass,
    disabled = false,
  }: {
    isOn: boolean;
    isPending: boolean;
    onclick: () => void;
    glowClass: string;
    disabled?: boolean;
  } = $props();
</script>

<button
  {onclick}
  disabled={disabled}
  class="w-full py-4 rounded-xl font-semibold uppercase tracking-wider transition-all relative overflow-hidden disabled:opacity-50
         {isOn ? `${glowClass} power-btn-on` : 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong'}"
>
  <span class="relative z-10 flex items-center justify-center gap-2">
    <Power class="w-5 h-5 {isPending ? 'animate-spin' : ''}" />
    {isOn ? 'Power Off' : 'Power On'}
  </span>
  {#if isPending}
    <div class="absolute inset-0 rounded-xl border-2 border-current animate-glow"></div>
  {/if}
</button>
