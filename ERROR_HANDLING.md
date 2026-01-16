# Error Handling System

## Overview

The project implements a centralized error handling and logging system. All errors go through a unified `errorHandler`, providing:

- ✅ Unified logging
- ✅ Error categorization by type and severity
- ✅ Contextual information for debugging
- ✅ Ready for integration with external services (Sentry, LogRocket, etc.)
- ✅ Error Boundary for React components

---

## Structure

### 1. Error Handler (`src/utils/errorHandler.ts`)

Centralized error handler with the following capabilities:

#### Error Categories (`ErrorCategory`)
- `STORAGE` - localStorage errors
- `NETWORK` - network errors
- `VALIDATION` - validation errors
- `RUNTIME` - runtime errors
- `UNKNOWN` - unknown errors

#### Severity Levels (`ErrorSeverity`)
- `LOW` - low (informational messages)
- `MEDIUM` - medium (warnings)
- `HIGH` - high (critical errors)
- `CRITICAL` - critical (critical system errors)

#### Usage

```typescript
import { logError, handleStorageError, ErrorSeverity, ErrorCategory } from '../utils/errorHandler';

// Basic logging
logError(error, ErrorSeverity.HIGH, ErrorCategory.STORAGE, {
  component: 'MyComponent',
  action: 'save',
  metadata: { userId: '123' }
});

// Specialized functions
handleStorageError(error, 'save', { component: 'PromptProvider' });
handleValidationError(error, 'title');
handleImportExportError(error, 'import', { component: 'App' });
handleRuntimeError(error, 'MyComponent');
```

---

### 2. Error Boundary (`src/components/error/ErrorBoundary.tsx`)

React component for catching errors in child components. Prevents complete application crash.

#### Usage

```typescript
import { ErrorBoundary } from '../components/error/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

Error Boundary is already integrated into the `Providers` component, wrapping the entire application.

#### Custom Fallback

```typescript
<ErrorBoundary
  fallback={<div>Custom error UI</div>}
  onError={(error, errorInfo) => {
    // Additional handling
  }}
>
  <YourComponent />
</ErrorBoundary>
```

---

## Project Integration

### Storage Errors

All localStorage errors are automatically logged:

```typescript
// src/utils/storage.ts
import { handleStorageError } from './errorHandler';

try {
  localStorage.setItem(key, value);
} catch (error) {
  handleStorageError(error, 'save', { metadata: { key } });
  throw error;
}
```

### Import/Export Errors

Import/export errors are logged with context:

```typescript
// src/utils/exportImport.ts
import { handleImportExportError } from './errorHandler';

try {
  // import logic
} catch (error) {
  handleImportExportError(error, 'import', {
    component: 'App',
    metadata: { fileName: file.name }
  });
  throw error;
}
```

### React Components

Component errors are automatically caught by Error Boundary and logged.

---

## Logging

### In Development

In development mode, errors are logged to console with appropriate levels:
- `console.error` for CRITICAL and HIGH
- `console.warn` for MEDIUM
- `console.info` for LOW

### In Production

In production, external services can be integrated:

```typescript
// src/utils/errorHandler.ts
private sendToErrorService(loggedError: LoggedError): void {
  // Example Sentry integration
  if (window.Sentry) {
    window.Sentry.captureException(loggedError.error, {
      level: loggedError.severity,
      tags: { category: loggedError.category },
      extra: loggedError.context,
    });
  }
}
```

---

## Getting Error Logs

```typescript
import { errorHandler } from '../utils/errorHandler';

// Get recent errors
const recentErrors = errorHandler.getErrorLog(10); // last 10

// Clear log
errorHandler.clearErrorLog();
```

---

## Recommendations

1. **Always add context** - this helps with debugging:
   ```typescript
   handleStorageError(error, 'save', {
     component: 'ComponentName',
     action: 'specificAction',
     metadata: { relevantData: value }
   });
   ```

2. **Use the correct severity level**:
   - `LOW` - for validation and non-critical issues
   - `MEDIUM` - for normal errors
   - `HIGH` - for critical errors affecting functionality
   - `CRITICAL` - for errors breaking the application

3. **Don't log sensitive data** in metadata (passwords, tokens, etc.)

4. **For production** integrate an external monitoring service (Sentry, LogRocket, Rollbar)

---

## Usage Examples

### Handling Errors in Async Functions

```typescript
const loadData = async () => {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    handleRuntimeError(error, 'DataLoader', {
      action: 'fetchData',
      metadata: { endpoint: '/api/data' }
    });
    throw error;
  }
};
```

### Handling Validation Errors

```typescript
const validatePrompt = (data: PromptFormData) => {
  if (!data.title.trim()) {
    const error = new Error('Title is required');
    handleValidationError(error, 'title', {
      component: 'PromptEditor'
    });
    throw error;
  }
};
```

---

## Integration Status

✅ **Integrated:**
- Storage operations (`storage.ts`)
- Import/Export operations (`exportImport.ts`)
- Store operations (`promptStore.tsx`)
- App component (`App.tsx`)
- Error Boundary in Providers

🔄 **Can be improved:**
- Integration with external monitoring service (Sentry)
- Adding user ID to context (if authentication is added)
- Persistent error log storage
