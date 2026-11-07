export type LoadResult<T> = { data: T; error: string | null }

export async function safeDataLoad<T>(load: () => Promise<T>, fallback: T): Promise<LoadResult<T>> {
  try {
    return { data: await load(), error: null }
  } catch (cause) {
    return {
      data: fallback,
      error: cause instanceof Error ? cause.message : "Données temporairement indisponibles.",
    }
  }
}
