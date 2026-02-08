<script lang="ts">
  import { Minus, Plus } from 'lucide-svelte';
  import type { Snippet } from 'svelte';

  let {
    value,
    min,
    max,
    step = 1,
    inputStep,
    color,
    gradient,
    ariaLabel,
    ariaValueText,
    oninput,
    minBtnClass,
    maxBtnClass,
    after,
  }: {
    value: number;
    min: number;
    max: number;
    step?: number;
    inputStep?: number;
    color: string;
    gradient?: string;
    ariaLabel?: string;
    ariaValueText?: string;
    oninput: (value: number) => void;
    minBtnClass?: string;
    maxBtnClass?: string;
    after?: Snippet;
  } = $props();

  let percent = $derived(((value - min) / (max - min)) * 100);
  const defaultBtn = 'bg-surface-recessed border border-stroke-default text-content-secondary hover:border-stroke-strong hover:text-content-primary';
</script>

<div class="flex gap-2 items-center">
  <button
    onclick={() => oninput(Math.max(min, value - step))}
    disabled={value <= min}
    class="w-10 h-10 rounded-lg transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed {minBtnClass || defaultBtn}"
  >
    <Minus class="w-5 h-5" />
  </button>

  <div
    class="flex-1 h-10 rounded-lg overflow-hidden relative {gradient ? '' : 'bg-surface-recessed border border-stroke-default'}"
    style={gradient ? `background: ${gradient}` : ''}
  >
    {#if !gradient}
      <div
        class="absolute inset-y-0 left-0 transition-all duration-150"
        style="width: {percent}%; background: color-mix(in srgb, var({color}) 30%, transparent)"
      ></div>
    {/if}
    <div
      class="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-150"
      style="left: clamp(0px, calc({percent}% - 8px), calc(100% - 16px)); {gradient
        ? 'background: white; border: 2px solid var(--color-text-primary); box-shadow: 0 2px 6px rgba(0,0,0,0.3)'
        : `background: var(${color}); box-shadow: 0 0 10px var(${color})`}"
    ></div>
    <input
      type="range"
      {min}
      {max}
      step={inputStep ?? step}
      {value}
      oninput={(e) => oninput(parseInt(e.currentTarget.value))}
      aria-label={ariaLabel}
      aria-valuetext={ariaValueText}
      class="absolute inset-0 w-full h-full {ariaLabel ? 'slider-accessible' : 'opacity-0'} cursor-pointer"
    />
  </div>

  <button
    onclick={() => oninput(Math.min(max, value + step))}
    disabled={value >= max}
    class="w-10 h-10 rounded-lg transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed {maxBtnClass || defaultBtn}"
  >
    <Plus class="w-5 h-5" />
  </button>

  {#if after}
    {@render after()}
  {/if}
</div>
