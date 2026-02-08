<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    label,
    children,
  }: {
    label: string;
    children: Snippet;
  } = $props();
</script>

<div class="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-recessed border border-stroke-subtle">
  <span class="text-sm text-content-secondary uppercase tracking-wider">{label}</span>
  <span class="font-medium text-sm">
    {@render children()}
  </span>
</div>
