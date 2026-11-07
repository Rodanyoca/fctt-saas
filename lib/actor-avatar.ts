export function getActorAvatarUrl(
  avatarDriveUrl: string,
  avatarDriveId: string,
): string | undefined {
  const id = avatarDriveId.trim()
  if (id) {
    const proxyUrl = avatarDriveUrl.trim()
    if (proxyUrl.startsWith("/api/avatars/")) return proxyUrl

    // Drive files are private and must be served by the authenticated proxy.
    return `/api/avatars/${encodeURIComponent(id)}`
  }

  const url = avatarDriveUrl.trim()
  return /^(?:https?:\/\/|\/)/i.test(url) ? url : undefined
}
