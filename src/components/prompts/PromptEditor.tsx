import { useState, useEffect, useMemo, useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { Prompt, PromptFormData, Category } from '../../domain/prompt';
import { CATEGORIES } from '../../domain/prompt';
import { applyVariables, extractVariables } from '../../utils/templateEngine';
import { VariablesPanel } from './VariablesPanel';
import { PromptPreview } from './PromptPreview';

interface PromptEditorProps {
  prompt?: Prompt;
  onSave: (data: PromptFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function PromptEditor({
  prompt,
  onSave,
  onCancel,
  onDelete,
}: PromptEditorProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Other');
  const [template, setTemplate] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const previousTemplateRef = useRef<string>('');

  const isEditMode = !!prompt;

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setCategory(prompt.category);
      setTemplate(prompt.template);
      // Initialize variable values as empty
      const vars = extractVariables(prompt.template);
      const initialValues: Record<string, string> = {};
      vars.forEach((v) => {
        initialValues[v] = '';
      });
      setVariableValues(initialValues);
      previousTemplateRef.current = prompt.template;
    } else {
      setTitle('');
      setCategory('Other');
      setTemplate('');
      setVariableValues({});
      previousTemplateRef.current = '';
    }
  }, [prompt]);

  // Update variable values when template changes
  useEffect(() => {
    // Only update if template actually changed (avoid unnecessary recalculations)
    if (template === previousTemplateRef.current) {
      return;
    }
    previousTemplateRef.current = template;
    
    const vars = extractVariables(template);
    setVariableValues((prev) => {
      const newValues: Record<string, string> = {};
      vars.forEach((v) => {
        // Keep existing value if variable still exists, otherwise clear
        newValues[v] = prev[v] ?? '';
      });
      return newValues;
    });
  }, [template]);

  const preview = useMemo(() => {
    return applyVariables(template, variableValues);
  }, [template, variableValues]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!template.trim()) {
      alert('Please enter a template');
      return;
    }

    onSave({
      title: title.trim(),
      category,
      template: template.trim(),
    });
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  const categories = CATEGORIES;

  return (
    <div className="prompt-editor">
      <div className="prompt-editor__field">
        <label className="prompt-editor__label">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="Enter prompt title"
          className="prompt-editor__input"
        />
      </div>

      <div className="prompt-editor__field">
        <label className="prompt-editor__label">
          Category *
        </label>
        <select
          value={category}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as Category)}
          className="prompt-editor__select"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="prompt-editor__field">
        <label className="prompt-editor__label">
          Template * (use {'{variableName}'} for variables)
        </label>
        <textarea
          value={template}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTemplate(e.target.value)}
          placeholder="Enter your prompt template. Use {variableName} syntax for variables."
          rows={8}
          className="prompt-editor__textarea"
        />
      </div>

      <VariablesPanel
        template={template}
        values={variableValues}
        onValueChange={handleVariableChange}
      />

      <PromptPreview preview={preview} />

      <div className="prompt-editor__actions">
        <button
          onClick={handleSave}
          className="prompt-editor__button prompt-editor__button--primary"
        >
          {isEditMode ? 'Save Changes' : 'Create Prompt'}
        </button>
        {isEditMode && onDelete && (
          <button
            onClick={onDelete}
            className="prompt-editor__button prompt-editor__button--danger"
          >
            Delete
          </button>
        )}
        <button
          onClick={onCancel}
          className="prompt-editor__button prompt-editor__button--secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
