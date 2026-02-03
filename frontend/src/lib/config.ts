// Auth token for API requests - injected at build time via Vite
// Set VITE_AUTH_TOKEN environment variable during build
export const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN || '';
