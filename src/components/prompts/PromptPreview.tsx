interface PromptPreviewProps {
  preview: string;
}

export function PromptPreview({ preview }: PromptPreviewProps) {
  return (
    <div className="prompt-preview">
      <h3 className="prompt-preview__title">
        Final Prompt Preview
      </h3>
      <div className="prompt-preview__content">
        <pre className="prompt-preview__text">
          {preview || (
            <span className="prompt-preview__placeholder">
              Preview will appear here when you fill in the variables...
            </span>
          )}
        </pre>
      </div>
    </div>
  );
}
