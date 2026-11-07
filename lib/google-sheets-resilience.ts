export function isTransientSheetsError(error: unknown) {
  const candidate = error as { code?: number | string; response?: { status?: number }; message?: string }
  const status = Number(candidate?.response?.status ?? candidate?.code)
  if ([408, 429, 500, 502, 503, 504].includes(status)) return true
  const message = String(candidate?.message ?? error ?? "").toLowerCase()
  return ["timeout", "timed out", "econnreset", "enotfound", "socket hang up", "rate limit", "temporarily unavailable"].some((part) => message.includes(part))
}

export async function withBoundedRetry<T>(operation: () => Promise<T>, wait: (milliseconds: number) => Promise<void> = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)), retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try { return await operation() } catch (error) {
      if (attempt >= retries || !isTransientSheetsError(error)) throw error
      await wait(150 * 2 ** attempt)
    }
  }
  throw new Error("Nombre maximal de tentatives dépassé.")
}
