/**
 * Extracts unique variable names from template string.
 * Variables are in format: {variableName} or { variableName }
 * Spaces inside braces are ignored.
 * 
 * @param template - Template string with variables in curly braces
 * @returns Array of unique variable names (without braces or spaces)
 */
export function extractVariables(template: string): string[] {
  const variablePattern = /\{([^}]+)\}/g;
  const matches = template.matchAll(variablePattern);
  const variables = new Set<string>();

  for (const match of matches) {
    const variableName = match[1].trim();
    if (variableName) {
      variables.add(variableName);
    }
  }

  return Array.from(variables);
}

/**
 * Applies variable values to template string.
 * Replaces {variableName} with corresponding value from values object.
 * 
 * @param template - Template string with variables
 * @param values - Object mapping variable names to their values
 * @returns Final prompt with variables replaced
 */
export function applyVariables(
  template: string,
  values: Record<string, string>
): string {
  let result = template;
  const variablePattern = /\{([^}]+)\}/g;

  result = result.replace(variablePattern, (match, variableName) => {
    const key = variableName.trim();
    const value = values[key] ?? '';
    return value;
  });

  return result;
}
