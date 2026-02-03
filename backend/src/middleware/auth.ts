import type { Context, Next } from 'hono';
import { config } from '../config';

/**
 * Bearer token authentication middleware.
 * Validates Authorization header against AUTH_TOKEN from config.
 * Returns 401 if token is missing or invalid.
 */
export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Missing or invalid Authorization header', code: 'UNAUTHORIZED' }, 401);
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  if (token !== config.auth.token) {
    return c.json({ success: false, error: 'Invalid token', code: 'UNAUTHORIZED' }, 401);
  }

  await next();
}
