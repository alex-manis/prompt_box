import { useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { extractVariables } from '../../utils/templateEngine';

interface VariablesPanelProps {
  template: string;
  values: Record<string, string>;
  onValueChange: (variable: string, value: string) => void;
}

export function VariablesPanel({
  template,
  values,
  onValueChange,
}: VariablesPanelProps) {
  const variables = useMemo(() => {
    return extractVariables(template);
  }, [template]);

  if (variables.length === 0) {
    return (
      <div className="variables-panel__empty">
        <p className="variables-panel__empty-text">
          No variables found in template. Add variables using {'{variableName}'} syntax.
        </p>
      </div>
    );
  }

  return (
    <div className="variables-panel">
      <h3 className="variables-panel__title">
        Variables ({variables.length})
      </h3>
      <div className="variables-panel__list">
        {variables.map((variable) => (
          <div key={variable} className="variables-panel__item">
            <label className="variables-panel__label">
              {variable}
            </label>
            <input
              type="text"
              value={values[variable] ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onValueChange(variable, e.target.value)}
              placeholder={`Enter value for ${variable}`}
              className="variables-panel__input"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
