export function asText(value: unknown): string {
  return value === null || value === undefined ? "" : String(value).trim()
}

export function normalize(value: unknown): string {
  return asText(value).toUpperCase()
}
