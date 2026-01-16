import type { ReactNode } from 'react';
import { PromptProvider } from '../store/promptStore';
import { ThemeProvider } from '../components/layout/ThemeProvider';
import { ErrorBoundary } from '../components/error/ErrorBoundary';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PromptProvider>
          {children}
        </PromptProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
