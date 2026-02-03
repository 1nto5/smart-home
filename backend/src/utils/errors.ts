/**
 * Safely extracts an error message from an unknown error type.
 * Use this in catch blocks instead of `catch (e: any)`.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Type guard to check if an error has a specific property.
 */
export function hasErrorCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}
