// Offline state management

interface OfflineState {
  isOnline: boolean;
  lastOnline: Date | null;
  pendingActions: QueuedAction[];
}

interface QueuedAction {
  id: string;
  endpoint: string;
  method: string;
  body?: unknown;
  createdAt: Date;
  retries: number;
}

const STORAGE_KEY = 'smart-home-offline-queue';

// Reactive offline state
const state = $state<OfflineState>({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastOnline: null,
  pendingActions: [],
});

// Load queued actions from localStorage
function loadQueue(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      state.pendingActions = parsed.map((a: QueuedAction) => ({
        ...a,
        createdAt: new Date(a.createdAt),
      }));
    }
  } catch {
    // Ignore parse errors
  }
}

// Save queue to localStorage
function saveQueue(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.pendingActions));
  } catch {
    // Ignore storage errors
  }
}

// Initialize event listeners
export function initOfflineSupport(): void {
  if (typeof window === 'undefined') return;

  loadQueue();

  window.addEventListener('online', () => {
    state.isOnline = true;
    state.lastOnline = new Date();
    // Process queued actions
    processQueue();
  });

  window.addEventListener('offline', () => {
    state.isOnline = false;
  });
}

// Queue an action to be retried when online
export function queueAction(
  endpoint: string,
  method: string,
  body?: unknown
): void {
  const action: QueuedAction = {
    id: crypto.randomUUID(),
    endpoint,
    method,
    body,
    createdAt: new Date(),
    retries: 0,
  };
  state.pendingActions.push(action);
  saveQueue();
}

// Process queued actions
async function processQueue(): Promise<void> {
  if (!state.isOnline || state.pendingActions.length === 0) return;

  const queue = [...state.pendingActions];
  state.pendingActions = [];

  for (const action of queue) {
    try {
      await fetch(action.endpoint, {
        method: action.method,
        headers: action.body ? { 'Content-Type': 'application/json' } : undefined,
        body: action.body ? JSON.stringify(action.body) : undefined,
      });
    } catch {
      // Re-queue if failed
      if (action.retries < 3) {
        action.retries++;
        state.pendingActions.push(action);
      }
    }
  }

  saveQueue();
}

// Getters for reactive state
export function getOfflineState() {
  return state;
}

export function isOnline(): boolean {
  return state.isOnline;
}

export function getPendingCount(): number {
  return state.pendingActions.length;
}

export function clearPendingActions(): void {
  state.pendingActions = [];
  saveQueue();
}
