/**
 * Utility functions for user notifications
 * Can be extended to use toast libraries in the future
 */

export function showError(message: string): void {
  // TODO: Replace with proper toast/notification system
  // For now, using alert but errors are also logged via errorHandler
  alert(`Error: ${message}`);
}

export function showSuccess(message: string): void {
  // TODO: Replace with proper toast/notification system
  alert(`Success: ${message}`);
}

export function showWarning(message: string): void {
  // TODO: Replace with proper toast/notification system
  alert(`Warning: ${message}`);
}

export function confirmAction(message: string): boolean {
  // TODO: Replace with proper confirmation dialog
  return window.confirm(message);
}
