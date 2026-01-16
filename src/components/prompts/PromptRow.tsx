import { useMemo } from 'react';
import type { Prompt } from '../../domain/prompt';

interface PromptRowProps {
  prompt: Prompt;
  onClick: () => void;
}

const MAX_TEMPLATE_PREVIEW_LENGTH = 100;

export function PromptRow({ prompt, onClick }: PromptRowProps) {
  const truncatedTemplate = useMemo(() => {
    if (prompt.template.length <= MAX_TEMPLATE_PREVIEW_LENGTH) {
      return prompt.template;
    }
    return prompt.template.substring(0, MAX_TEMPLATE_PREVIEW_LENGTH) + '...';
  }, [prompt.template]);

  const formattedDate = useMemo(() => {
    return new Date(prompt.updatedAt).toLocaleDateString();
  }, [prompt.updatedAt]);

  return (
    <tr className="prompt-row" onClick={onClick}>
      <td className="prompt-row__cell prompt-row__cell--title">
        {prompt.title}
      </td>
      <td className="prompt-row__cell prompt-row__cell--category">
        <span className="prompt-row__badge">{prompt.category}</span>
      </td>
      <td className="prompt-row__cell prompt-row__cell--template">
        {truncatedTemplate}
      </td>
      <td className="prompt-row__cell prompt-row__cell--date">
        {formattedDate}
      </td>
    </tr>
  );
}
