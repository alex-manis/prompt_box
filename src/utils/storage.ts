import type { Prompt } from '../domain/prompt';
import { handleStorageError } from './errorHandler';

const STORAGE_KEY = 'ai-prompt-manager-prompts';
const STORAGE_VERSION = 'v1';

interface StorageSchema {
  version: string;
  prompts: Prompt[];
}

/**
 * Loads prompts from localStorage with versioning and graceful fallback
 */
export function loadPrompts(): Prompt[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data = JSON.parse(stored) as StorageSchema;
    
    // Version check - if version mismatch, return empty array
    if (data.version !== STORAGE_VERSION) {
      handleStorageError(
        new Error('Storage version mismatch'),
        'load',
        { metadata: { expectedVersion: STORAGE_VERSION, foundVersion: data.version } }
      );
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Validate prompts structure
    if (!Array.isArray(data.prompts)) {
      return [];
    }

    return data.prompts;
  } catch (error) {
    handleStorageError(error, 'load');
    return [];
  }
}

/**
 * Saves prompts to localStorage with versioning
 */
export function savePrompts(prompts: Prompt[]): void {
  try {
    const data: StorageSchema = {
      version: STORAGE_VERSION,
      prompts,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      handleStorageError(error, 'save', { metadata: { promptsCount: prompts.length } });
      throw new Error('Storage quota exceeded. Please free up some space and try again.');
    }
    handleStorageError(error, 'save', { metadata: { promptsCount: prompts.length } });
    throw error;
  }
}
