/** Existing read-only protection retained; real personal data stays on loopback. */
export function localReadAccess(request: Request) {
  try {
    const url = new URL(request.url), host = request.headers.get('host') || url.host
    const authority = new URL(`${url.protocol}//${host}`)
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(authority.hostname)) return false
    return !request.headers.has('x-forwarded-host') || request.headers.get('x-forwarded-host') === host
  } catch { return false }
}
