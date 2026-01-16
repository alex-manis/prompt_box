# AI Prompt Manager

A production-quality personal AI prompt library built with React, TypeScript, and TailwindCSS. Manage your AI prompts with a clean, intuitive interface featuring dynamic template variables, search, filtering, and export/import capabilities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173` (or the next available port).

## 📋 Features

### Core Functionality

- **CRUD Operations**: Create, read, update, and delete prompts
- **Search**: Search prompts by title or template content
- **Category Filtering**: Filter prompts by category (Coding, Writing, Marketing, Other)
- **Dynamic Template Engine**: 
  - Automatically detects variables in `{variableName}` format
  - Real-time variable input fields generation
  - Live preview of final prompt with variable substitution
  - Handles edge cases: duplicate variables, variable removal, empty values
- **Pagination**: Navigate through prompts with configurable page sizes (10, 20, 50)
- **Dark/Light Theme**: Toggle between themes with persistent storage
- **Responsive Design**: Mobile-friendly interface
- **Loading States**: Simulated loading delays (400-700ms) for better UX
- **Empty States**: Helpful messages when no prompts exist or filters return no results
- **Delete Confirmation**: Safety dialog before deleting prompts

### Bonus Features

- **Export/Import**: 
  - Export all prompts to JSON file
  - Import prompts from JSON with validation
  - Merge or replace options on import
  - Error handling and user feedback

## 🏗️ Architecture

### Project Structure

```
src/
├── app/
│   ├── App.tsx           # Main application component
│   └── providers.tsx     # Context providers wrapper
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx           # Search, filters, actions bar
│   │   ├── EmptyState.tsx       # Empty state component
│   │   ├── Modal.tsx            # Reusable modal component
│   │   └── ThemeProvider.tsx    # Theme context provider
│   └── prompts/
│       ├── PromptList.tsx       # Main list with pagination
│       ├── PromptRow.tsx        # Table row component
│       ├── PromptEditor.tsx     # Create/Edit form
│       ├── VariablesPanel.tsx   # Dynamic variables input
│       ├── PromptPreview.tsx    # Final prompt preview
│       └── Pagination.tsx       # Pagination controls
├── domain/
│   ├── prompt.ts         # Prompt types and interfaces
│   └── theme.ts          # Theme types
├── store/
│   ├── promptStore.tsx   # Context + Provider
│   └── promptReducer.ts  # State reducer
├── utils/
│   ├── storage.ts        # localStorage persistence
│   ├── templateEngine.ts # Variable extraction/substitution
│   ├── uuid.ts           # ID generation
│   └── exportImport.ts   # Export/Import utilities
├── styles/
│   └── index.css         # Global styles + Tailwind
└── main.tsx              # Entry point
```

### Key Architectural Decisions

1. **State Management**: Context API + useReducer (no Redux)
   - Centralized state management
   - Predictable state updates via reducer
   - Type-safe actions

2. **Persistence Layer**: 
   - Versioned localStorage schema (`v1`)
   - Graceful fallback on version mismatch
   - Error handling and validation

3. **Template Engine**:
   - Pure functions: `extractVariables()` and `applyVariables()`
   - Handles edge cases: spaces in braces, duplicates, removal
   - Testable and isolated logic

4. **Component Architecture**:
   - Small, focused components
   - Separation of concerns (layout, prompts, utilities)
   - Reusable UI components (Modal, EmptyState)

5. **Type Safety**:
   - Strict TypeScript configuration
   - No `any` types
   - Domain types in separate files

## 🎨 UI/UX Decisions

- **Modal-based Editor**: Editor opens in a modal for focused editing experience
- **Real-time Preview**: Variables panel updates preview instantly as user types
- **Empty Values Handling**: Empty variables show placeholder text in preview
- **Responsive Table**: Table layout on desktop, maintains usability on mobile
- **Loading Simulation**: 400-700ms delay simulates real-world loading for better UX perception
- **Theme Persistence**: Theme preference saved to localStorage

## 📝 Data Schema

### Prompt Schema

```typescript
interface Prompt {
  id: string;              // UUID
  title: string;           // Prompt title
  category: 'Coding' | 'Writing' | 'Marketing' | 'Other';
  template: string;        // Template with {variables}
  createdAt: number;       // Timestamp
  updatedAt: number;       // Timestamp
}
```

### Storage Schema

```typescript
interface StorageSchema {
  version: string;         // 'v1'
  prompts: Prompt[];
}
```

## 🔧 Technical Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Context API + useReducer** - State management
- **LocalStorage** - Data persistence
- **clsx** - Conditional class names utility

## 🧪 Testing Considerations

The template engine utilities (`extractVariables`, `applyVariables`) are designed to be easily testable:

```typescript
// Example test cases:
extractVariables('Hello {name}') // ['name']
extractVariables('{topic} and {topic}') // ['topic'] (unique)
extractVariables('{ topic }') // ['topic'] (spaces ignored)
applyVariables('Hi {name}', { name: 'John' }) // 'Hi John'
```

## 🚧 Assumptions & Decisions

1. **Variable Syntax**: Variables use `{variableName}` format. Spaces inside braces are ignored (`{ name }` = `name`).

2. **Empty Values**: When a variable has no value, it's replaced with an empty string in the preview, with a placeholder message shown when all variables are empty.

3. **Duplicate Variables**: Multiple occurrences of the same variable share one input field.

4. **Variable Removal**: When a variable is removed from template, its input disappears and value is cleared from state.

5. **Import Strategy**: User chooses between replace (overwrite all) or merge (add new, skip duplicates by ID).

6. **Pagination**: Default page size is 10, with options for 20 and 50. Resets to page 1 when filters change.

7. **Loading Delay**: Simulated 400-700ms delay on initial load and CRUD operations for better UX perception.

8. **Theme Default**: Uses system preference on first visit, then remembers user choice.

## 🔮 One Improvement I Would Make

**Add Prompt Templates/Examples**: I would add a feature to provide starter templates for common use cases (e.g., "Code Review", "Blog Post", "Email Draft"). This would help users get started faster and discover best practices for prompt engineering. Implementation would include:
- Pre-defined template library
- "Use Template" button in editor
- Community-contributed templates (future enhancement)

## ⏱️ Time Spent

*[Placeholder - to be filled by developer]*

Estimated breakdown:
- Project setup & configuration: ~30 min
- Domain types & utilities: ~45 min
- Store & persistence: ~1 hour
- UI components: ~2 hours
- Template engine & variables: ~1 hour
- Pagination & filtering: ~45 min
- Theme toggle: ~30 min
- Export/Import: ~45 min
- Polish & testing: ~1 hour
- Documentation: ~30 min

**Total: ~8-9 hours**

## 📄 License

ISC
