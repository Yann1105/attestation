export function extractVariables(text: string): string[] {
  const matches = [...text.matchAll(/\{\{(\w+)\}\}/g)];
  return matches.map(m => m[1]);
}

export function replaceVariables(text: string, data: Record<string, any>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key] !== undefined && data[key] !== null
      ? data[key]
      : `{{${key}}}`;
  });
}