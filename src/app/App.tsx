import { useState } from 'react';
import { Providers } from './providers';
import { TopBar } from '../components/layout/TopBar';
import { Footer } from '../components/layout/Footer';
import { PromptList } from '../components/prompts/PromptList';
import { PromptEditor } from '../components/prompts/PromptEditor';
import { Modal } from '../components/layout/Modal';
import { usePromptStore } from '../store/promptStore';
import type { Prompt, PromptFormData } from '../domain/prompt';
import { downloadPrompts, readImportFile } from '../utils/exportImport';
import { handleImportExportError } from '../utils/errorHandler';
import { showError } from '../utils/notifications';

function AppContent() {
  const { state, addPrompt, updatePrompt, deletePrompt, importPrompts } = usePromptStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deleteConfirmPrompt, setDeleteConfirmPrompt] = useState<Prompt | null>(null);

  const handleAddPrompt = () => {
    setEditingPrompt(undefined);
    setIsEditorOpen(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsEditorOpen(true);
  };

  const handleSave = (data: PromptFormData) => {
    if (editingPrompt) {
      updatePrompt(editingPrompt.id, data);
    } else {
      addPrompt(data);
    }
    setIsEditorOpen(false);
    setEditingPrompt(undefined);
  };

  const handleCancel = () => {
    setIsEditorOpen(false);
    setEditingPrompt(undefined);
  };

  const handleDeleteClick = () => {
    if (editingPrompt) {
      setDeleteConfirmPrompt(editingPrompt);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmPrompt) {
      deletePrompt(deleteConfirmPrompt.id);
      setDeleteConfirmPrompt(null);
      setIsEditorOpen(false);
      setEditingPrompt(undefined);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmPrompt(null);
  };

  const handleExport = () => {
    try {
      downloadPrompts(state.prompts);
    } catch (error) {
      handleImportExportError(error, 'export', { 
        component: 'App',
        metadata: { promptsCount: state.prompts.length }
      });
      showError('Failed to export prompts. Please try again.');
    }
  };

  const handleImport = async (file: File) => {
    try {
      const prompts = await readImportFile(file);

      // Ask user if they want to replace or merge
      const action = window.confirm(
        `Found ${prompts.length} prompts. Do you want to replace all existing prompts? (Cancel to merge)`
      );

      if (action) {
        // Replace
        importPrompts(prompts);
      } else {
        // Merge (add new prompts, keeping existing ones)
        const existingIds = new Set(state.prompts.map((p: Prompt) => p.id));
        const newPrompts = prompts.filter((p: Prompt) => !existingIds.has(p.id));
        if (newPrompts.length > 0) {
          importPrompts([...state.prompts, ...newPrompts]);
        } else {
          alert('All prompts from the file already exist.');
        }
      }
    } catch (error) {
      handleImportExportError(error, 'import', { 
        component: 'App',
        metadata: { existingPromptsCount: state.prompts.length }
      });
      const message = error instanceof Error ? error.message : 'Failed to import prompts';
      showError(`Import failed: ${message}`);
    }
  };

  return (
    <div className="app">
      <TopBar
        onAddPrompt={handleAddPrompt}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="app__main">
        <PromptList
          onEditPrompt={handleEditPrompt}
          onAddPrompt={handleAddPrompt}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />
      </main>

      <Footer />

      <Modal
        isOpen={isEditorOpen}
        onClose={handleCancel}
        title={editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
      >
        <PromptEditor
          prompt={editingPrompt}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDeleteClick}
        />
      </Modal>

      {deleteConfirmPrompt && (
        <Modal isOpen={true} onClose={handleDeleteCancel} title="Delete Prompt">
          <div className="modal-confirm">
            <p className="modal-confirm__message">
              Are you sure you want to delete &quot;{deleteConfirmPrompt.title}&quot;? This action cannot be undone.
            </p>
            <div className="modal-confirm__actions">
              <button
                onClick={handleDeleteCancel}
                className="modal-confirm__button modal-confirm__button--secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="modal-confirm__button modal-confirm__button--danger"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}
