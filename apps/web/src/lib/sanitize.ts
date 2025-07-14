const HTML_TAG = /<[^>]*>/g;

export function sanitizeDisplayText(value: string, maxLength = 120): string {
  const stripped = value.replace(HTML_TAG, "").trim();
  if (stripped.length <= maxLength) {
    return stripped;
  }
  return `${stripped.slice(0, maxLength)}…`;
}
