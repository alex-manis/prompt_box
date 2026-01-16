import type { ChangeEvent } from 'react';
import { useTheme } from './ThemeProvider';
import { CATEGORIES } from '../../domain/prompt';

interface TopBarProps {
    onAddPrompt: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    onExport: () => void;
    onImport: (file: File) => void;
}

export function TopBar({
    onAddPrompt,
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    onExport,
    onImport,
}: TopBarProps) {
    const { theme, toggleTheme } = useTheme();
    const categories: Array<{ value: string; label: string }> = [
        { value: '', label: 'All Categories' },
        ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
    ];

    return (
        <div className="top-bar">
            <div className="top-bar__container">
                <div className="top-bar__content">
                    <div className="top-bar__search">
                        <input
                            type="text"
                            placeholder="Search prompts by title or template..."
                            value={searchQuery}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
                            className="top-bar__search-input"
                        />
                    </div>

                    <div className="top-bar__category">
                        <select
                            value={selectedCategory}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => onCategoryChange(e.target.value)}
                            className="top-bar__category-select"
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={onAddPrompt}
                        className="top-bar__button top-bar__button--primary"
                    >
                        Add Prompt
                    </button>

                    <div className="top-bar__actions">
                        <button
                            onClick={onExport}
                            className="top-bar__button top-bar__button--secondary"
                            title="Export prompts"
                        >
                            📥 Export
                        </button>
                        <label className="top-bar__import-label">
                            📤 Import
                            <input
                                type="file"
                                accept=".json"
                                className="top-bar__import-input"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        onImport(file);
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </label>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="top-bar__button top-bar__button--theme"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>
        </div>
    );
}
