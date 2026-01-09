/**
 * Creates a debounced function that delays invoking `fn` until after `wait` ms
 * have elapsed since the last call. Returns a tuple of [debouncedFn, cancel].
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): [(...args: Parameters<T>) => void, () => void] {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, wait);
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return [debounced, cancel];
}
