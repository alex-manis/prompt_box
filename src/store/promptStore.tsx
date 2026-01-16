import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Prompt, PromptFormData } from '../domain/prompt';
import { promptReducer, type PromptState } from './promptReducer';
import { loadPrompts, savePrompts } from '../utils/storage';
import type { PromptAction } from './promptReducer';
import { handleStorageError, ErrorSeverity, ErrorCategory } from '../utils/errorHandler';

interface PromptContextValue {
  state: PromptState;
  dispatch: React.Dispatch<PromptAction>;
  addPrompt: (data: PromptFormData) => void;
  updatePrompt: (id: string, data: PromptFormData) => void;
  deletePrompt: (id: string) => void;
  importPrompts: (prompts: Prompt[]) => void;
}

const PromptContext = createContext<PromptContextValue | undefined>(undefined);

const initialState: PromptState = {
  prompts: [],
  isLoading: true,
};

interface PromptProviderProps {
  children: ReactNode;
}

export function PromptProvider({ children }: PromptProviderProps) {
  const [state, dispatch] = useReducer(promptReducer, initialState);

  // Load prompts on mount
  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      dispatch({ type: 'LOAD_START' });
      
      // Simulate loading delay (400-700ms)
      const delay = 400 + Math.random() * 300;
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      // Check if component was unmounted
      if (cancelled) return;
      
      try {
        const prompts = loadPrompts();
        if (!cancelled) {
          dispatch({ type: 'LOAD_SUCCESS', payload: prompts });
        }
      } catch (error) {
        if (!cancelled) {
          handleStorageError(error, 'load', { component: 'PromptProvider' });
          dispatch({ type: 'LOAD_ERROR' });
        }
      }
    };

    loadData();
    
    return () => {
      cancelled = true;
    };
  }, []);

  // Save prompts whenever they change
  useEffect(() => {
    if (!state.isLoading) {
      try {
        savePrompts(state.prompts);
      } catch (error) {
        handleStorageError(error, 'save', { 
          component: 'PromptProvider',
          metadata: { promptsCount: state.prompts.length }
        });
      }
    }
  }, [state.prompts, state.isLoading]);

  const addPrompt = useCallback((data: PromptFormData) => {
    dispatch({ type: 'ADD_PROMPT', payload: data });
  }, []);

  const updatePrompt = useCallback((id: string, data: PromptFormData) => {
    dispatch({ type: 'UPDATE_PROMPT', payload: { id, data } });
  }, []);

  const deletePrompt = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PROMPT', payload: id });
  }, []);

  const importPrompts = useCallback((prompts: Prompt[]) => {
    dispatch({ type: 'IMPORT_PROMPTS', payload: prompts });
  }, []);

  const value: PromptContextValue = {
    state,
    dispatch,
    addPrompt,
    updatePrompt,
    deletePrompt,
    importPrompts,
  };

  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  );
}

export function usePromptStore() {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error('usePromptStore must be used within a PromptProvider');
  }
  return context;
}
