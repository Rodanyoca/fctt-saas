import 'server-only'
import { NextResponse } from 'next/server'
import { localReadAccess } from './access'
import { PlayerReadError, loadPlayer, loadPlayers } from './players-domain'
import { readFcttSheets } from './sheets-server'
export async function playerResponse(request: Request, id?: string) {
  if (!localReadAccess(request)) return NextResponse.json({ error: { code: 'access', message: 'Accès local uniquement.' } }, { status: 403 })
  try {
    const body = id === undefined ? { players: await loadPlayers(readFcttSheets) } : { player: await loadPlayer(id, readFcttSheets) }
    return NextResponse.json(body, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    const failure = error instanceof PlayerReadError ? error : new PlayerReadError('connection', 'Lecture FCTT indisponible.')
    return NextResponse.json({ error: { code: failure.code, message: failure.message } }, { status: failure.code === 'not_found' ? 404 : failure.code === 'schema' ? 502 : 503, headers: { 'Cache-Control': 'private, no-store' } })
  }
}
