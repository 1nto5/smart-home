import type { ApplyResult } from './types';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let nextId = 0;
let toasts = $state<Toast[]>([]);

function addToast(message: string, type: ToastType, duration = 3000) {
  const id = nextId++;
  toasts.push({ id, message, type });
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
  }, duration);
}

export function getToasts() {
  return toasts;
}

export function showApplyResult(result: ApplyResult, name: string) {
  const { success, pending, failed } = result;
  if (failed.length > 0) {
    addToast(`${name}: ${failed.length} failed`, 'error');
  } else if (pending.length > 0) {
    addToast(`${name}: ${pending.length} pending`, 'warning');
  } else {
    addToast(`${name} applied`, 'success');
  }
}

export const notify = {
  success: (msg: string) => addToast(msg, 'success'),
  error: (msg: string) => addToast(msg, 'error'),
  warning: (msg: string) => addToast(msg, 'warning'),
  info: (msg: string) => addToast(msg, 'info'),
};
