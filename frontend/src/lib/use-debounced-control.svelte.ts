/**
 * Reusable debounced control helper for device sliders.
 * Manages preview state + debounced API call + cleanup.
 */

import { debounce } from './debounce';

export interface DebouncedControl {
  /** Current preview value (null = use server state) */
  readonly preview: number | null;
  /** Call from oninput handler — sets preview and debounces the API call */
  handle: (value: number) => void;
}

/**
 * Creates a debounced control with preview state.
 *
 * @param sendFn - async function that sends the value to the API
 * @param opts.delay - debounce delay in ms (default 300)
 * @param opts.clamp - optional [min, max] to clamp input values
 */
export function useDebouncedControl(
  sendFn: (value: number) => Promise<void>,
  opts: { delay?: number; clamp?: [number, number] } = {}
): DebouncedControl {
  const { delay = 300, clamp } = opts;

  let preview = $state<number | null>(null);

  const [sendDebounced] = debounce(async (value: number) => {
    try {
      await sendFn(value);
    } catch (e) {
      console.error(e);
    }
    preview = null;
  }, delay);

  function handle(value: number) {
    if (clamp) {
      value = Math.max(clamp[0], Math.min(clamp[1], Math.round(value)));
    }
    preview = value;
    sendDebounced(value);
  }

  return {
    get preview() { return preview; },
    handle,
  };
}
