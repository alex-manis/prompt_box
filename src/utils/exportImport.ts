import type { Prompt } from '../domain/prompt';
import { handleImportExportError, ErrorSeverity } from './errorHandler';

export interface ExportData {
  version: string;
  exportedAt: number;
  prompts: Prompt[];
}

/**
 * Exports prompts to JSON format
 */
export function exportPrompts(prompts: Prompt[]): string {
  const data: ExportData = {
    version: '1.0',
    exportedAt: Date.now(),
    prompts,
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Downloads prompts as JSON file
 */
export function downloadPrompts(prompts: Prompt[]): void {
  const json = exportPrompts(prompts);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-prompts-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Cleanup URL after a short delay to ensure download completes
  // Using requestAnimationFrame for better timing
  requestAnimationFrame(() => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  });
}

/**
 * Validates and parses imported JSON data
 */
export function validateImportData(data: unknown): Prompt[] {
  if (!data || typeof data !== 'object') {
    const error = new Error('Invalid file format: expected JSON object');
    handleImportExportError(error, 'import', { metadata: { dataType: typeof data } });
    throw error;
  }

  const obj = data as Record<string, unknown>;

  // Check if it's our export format
  if ('prompts' in obj && Array.isArray(obj.prompts)) {
    return validatePromptsArray(obj.prompts);
  }

  // Check if it's a direct array of prompts
  if (Array.isArray(data)) {
    return validatePromptsArray(data);
  }

  const error = new Error('Invalid file format: expected prompts array or export object');
  handleImportExportError(error, 'import');
  throw error;
}

/**
 * Validates array of prompts
 */
function validatePromptsArray(prompts: unknown[]): Prompt[] {
  const validPrompts: Prompt[] = [];

  for (const item of prompts) {
    if (
      item &&
      typeof item === 'object' &&
      'id' in item &&
      'title' in item &&
      'category' in item &&
      'template' in item &&
      'createdAt' in item &&
      'updatedAt' in item &&
      typeof (item as Prompt).id === 'string' &&
      typeof (item as Prompt).title === 'string' &&
      typeof (item as Prompt).category === 'string' &&
      typeof (item as Prompt).template === 'string' &&
      typeof (item as Prompt).createdAt === 'number' &&
      typeof (item as Prompt).updatedAt === 'number'
    ) {
      validPrompts.push(item as Prompt);
    }
  }

  if (validPrompts.length === 0) {
    const error = new Error('No valid prompts found in file');
    handleImportExportError(error, 'import', { metadata: { totalItems: prompts.length } });
    throw error;
  }

  return validPrompts;
}

/**
 * Reads file and returns parsed prompts
 */
export function readImportFile(file: File): Promise<Prompt[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          const error = new Error('Failed to read file');
          handleImportExportError(error, 'import', { metadata: { fileType: typeof e.target?.result } });
          reject(error);
          return;
        }

        const data = JSON.parse(text);
        const prompts = validateImportData(data);
        resolve(prompts);
      } catch (error) {
        if (error instanceof Error) {
          handleImportExportError(error, 'import', { metadata: { fileName: file.name, fileSize: file.size } });
          reject(error);
        } else {
          const error = new Error('Failed to parse JSON file');
          handleImportExportError(error, 'import', { metadata: { fileName: file.name } });
          reject(error);
        }
      }
    };

    reader.onerror = () => {
      const error = new Error('Failed to read file');
      handleImportExportError(error, 'import', { metadata: { fileName: file.name, fileSize: file.size } });
      reject(error);
    };

    reader.readAsText(file);
  });
}
