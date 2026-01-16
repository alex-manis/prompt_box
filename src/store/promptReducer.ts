import type { Prompt, PromptFormData } from '../domain/prompt';
import { generateId } from '../utils/uuid';

export interface PromptState {
  prompts: Prompt[];
  isLoading: boolean;
}

export type PromptAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Prompt[] }
  | { type: 'LOAD_ERROR' }
  | { type: 'ADD_PROMPT'; payload: PromptFormData }
  | { type: 'UPDATE_PROMPT'; payload: { id: string; data: PromptFormData } }
  | { type: 'DELETE_PROMPT'; payload: string }
  | { type: 'IMPORT_PROMPTS'; payload: Prompt[] };

export function promptReducer(
  state: PromptState,
  action: PromptAction
): PromptState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true };

    case 'LOAD_SUCCESS':
      return { prompts: action.payload, isLoading: false };

    case 'LOAD_ERROR':
      return { ...state, isLoading: false };

    case 'ADD_PROMPT': {
      const now = Date.now();
      const newPrompt: Prompt = {
        id: generateId(),
        ...action.payload,
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...state,
        prompts: [...state.prompts, newPrompt],
      };
    }

    case 'UPDATE_PROMPT': {
      const { id, data } = action.payload;
      return {
        ...state,
        prompts: state.prompts.map((prompt) =>
          prompt.id === id
            ? { ...prompt, ...data, updatedAt: Date.now() }
            : prompt
        ),
      };
    }

    case 'DELETE_PROMPT': {
      return {
        ...state,
        prompts: state.prompts.filter((prompt) => prompt.id !== action.payload),
      };
    }

    case 'IMPORT_PROMPTS': {
      return {
        ...state,
        prompts: action.payload,
      };
    }

    default:
      return state;
  }
}
