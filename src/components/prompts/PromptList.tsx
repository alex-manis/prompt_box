import { useState, useMemo, useEffect } from 'react';
import { usePromptStore } from '../../store/promptStore';
import type { Prompt } from '../../domain/prompt';
import { PromptRow } from './PromptRow';
import { Pagination } from './Pagination';
import { EmptyState } from '../layout/EmptyState';

interface PromptListProps {
  onEditPrompt: (prompt: Prompt) => void;
  onAddPrompt: () => void;
  searchQuery: string;
  selectedCategory: string;
}

export function PromptList({
  onEditPrompt,
  onAddPrompt,
  searchQuery,
  selectedCategory,
}: PromptListProps) {
  const { state } = usePromptStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter prompts
  const filteredPrompts = useMemo(() => {
    let filtered = state.prompts;

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.template.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [state.prompts, selectedCategory, searchQuery]);

  // Pagination
  const paginatedPrompts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredPrompts.slice(start, end);
  }, [filteredPrompts, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPrompts.length / pageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  if (state.isLoading) {
    return (
      <div className="prompt-list__loading">
        Loading prompts...
      </div>
    );
  }

  if (state.prompts.length === 0) {
    return (
      <EmptyState
        title="No prompts yet"
        description="Get started by creating your first AI prompt template."
        actionLabel="Add Your First Prompt"
        onAction={onAddPrompt}
      />
    );
  }

  if (filteredPrompts.length === 0) {
    return (
      <EmptyState
        title="No prompts found"
        description="Try adjusting your search or filter criteria."
      />
    );
  }

  return (
    <div className="prompt-list">
      <div className="prompt-list__table-wrapper">
        <table className="prompt-list__table">
          <thead className="prompt-list__thead">
            <tr>
              <th className="prompt-list__th">Title</th>
              <th className="prompt-list__th">Category</th>
              <th className="prompt-list__th">Template</th>
              <th className="prompt-list__th">Updated</th>
            </tr>
          </thead>
          <tbody className="prompt-list__tbody">
            {paginatedPrompts.map((prompt) => (
              <PromptRow
                key={prompt.id}
                prompt={prompt}
                onClick={() => onEditPrompt(prompt)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        totalItems={filteredPrompts.length}
      />
    </div>
  );
}
