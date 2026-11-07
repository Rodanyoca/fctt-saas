export function nextActorId(
  existingIds: string[],
  prefix: string,
  width = 5,
): string {
  const pattern = new RegExp(`^${prefix}(\\d+)$`, "i")
  const max = existingIds.reduce((highest, id) => {
    const match = id.match(pattern)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 0)
  return `${prefix}${String(max + 1).padStart(width, "0")}`
}
