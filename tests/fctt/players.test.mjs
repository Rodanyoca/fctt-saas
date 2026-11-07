import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadPlayers, loadPlayer, projection, PlayerReadError, columnName } from '../../lib/fctt/players-domain.ts'
import { configuration, books } from '../../lib/fctt/config.ts'
import { localReadAccess } from '../../lib/fctt/access.ts'
const snapshot = JSON.parse(readFileSync(new URL('./source-headers.json', import.meta.url), 'utf8'))
function fixture(actors = [], reversed = false) {
  let names = [...snapshot.headers, 'id_national', 'id_bwf', 'id_fie']
  if (reversed) names.reverse()
  const matrix = [names, ...actors.map(row => names.map(name => row[name] || ''))]
  const source = { acteurs: { ATHLETES: matrix }, referentiel: structuredClone(snapshot.references) }
  if (reversed) for (const sheet in source.referentiel) { const width = source.referentiel[sheet][0].length; source.referentiel[sheet] = source.referentiel[sheet].map(row => Array.from({ length: width }, (_, i) => row[i] ?? '').reverse()) }
  const calls = []
  const index = name => [...name].reduce((result, char) => result * 26 + char.charCodeAt(0) - 64, 0) - 1
  const read = async (book, ranges, fresh = false) => {
    calls.push({ book, ranges, fresh })
    return Object.fromEntries(ranges.map(range => {
      const [sheet, address] = range.replaceAll("'", '').split('!'), data = source[book][sheet]
      if (!data) throw new Error('Missing test sheet')
      if (address === '1:1') return [range, [data[0]]]
      const match = address.match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+)?)?$/)
      assert.ok(match, range)
      const start = Number(match[2]) - 1, end = match[3] ? (match[4] ? Number(match[4]) : data.length) : start + 1
      const values = data.slice(start, end).map(row => row.slice(index(match[1]), index(match[3] || match[1]) + 1))
      while (values.length && values.at(-1).every(cell => !cell)) values.pop()
      return [range, values]
    }))
  }
  return { source, calls, read }
}
const actor = { id_athlete: 'TTB-ATH-000001', nom_complet: 'Joueur Test', id_ittf: '', id_sexe: 'SEX001', nationalite: 'RDC', date_affiliation: '2026-01-02', statut: 'ACTIF', telephone: 'PRIVATE-PHONE', email: 'PRIVATE-EMAIL', adresse: 'PRIVATE-ADDRESS', date_naissance: '2000-01-03', numero_passeport: 'PRIVATE-PASSPORT', passeport_drive_id: 'PRIVATE-FILE', avatar_drive_url: 'PRIVATE-AVATAR', id_national: 'PRIVATE-NATIONAL', id_bwf: 'PRIVATE-BWF', id_fie: 'PRIVATE-FIE' }
test('real ATHLETES headers and references with no actors yield an empty list', async () => {
  assert.deepEqual(await loadPlayers(fixture().read), [])
})
test('list is a safe projection and resolves references by ID, not position', async () => {
  for (const reversed of [false, true]) {
    const data = fixture([actor], reversed), players = await loadPlayers(data.read)
    assert.deepEqual(players, [{ id: actor.id_athlete, ittf: '', name: actor.nom_complet, sex: 'MASCULIN', nationality: 'RDC', affiliation: '2026-01-02', status: 'ACTIF' }])
    assert.equal(JSON.stringify(players).includes('PRIVATE-'), false)
    const header = data.source.acteurs.ATHLETES[0]
    for (const call of data.calls.filter(call => call.book === 'acteurs')) for (const range of call.ranges.filter(range => !range.endsWith('1:1'))) {
      const column = range.match(/!([A-Z]+)/)[1]
      assert.ok(['id_athlete', 'nom_complet', 'id_sexe', 'nationalite', 'date_affiliation', 'statut', 'id_ittf'].some(name => columnName(header.indexOf(name)) === column))
    }
  }
})
test('detail first selects the ID, then reads only that actor row; no passport or media', async () => {
  const data = fixture([actor, { ...actor, id_athlete: 'TTB-ATH-000002', telephone: 'TARGET-PHONE', email: 'target@example.test' }])
  const detail = await loadPlayer('TTB-ATH-000002', data.read)
  assert.equal(detail.id, 'TTB-ATH-000002'); assert.equal(detail.telephone, 'TARGET-PHONE'); assert.equal(detail.birth, '2000-01-03')
  assert.equal(JSON.stringify(detail).includes('PRIVATE-PASSPORT'), false); assert.equal(JSON.stringify(detail).includes('PRIVATE-NATIONAL'), false)
  const actorCalls = data.calls.filter(call => call.book === 'acteurs')
  assert.equal(actorCalls.length, 3); assert.ok(actorCalls.every(call => call.fresh))
  assert.ok(actorCalls[2].ranges.every(range => /![A-Z]+3$/.test(range)))
})
test('unknown player is 404 without loading any other personal fields or references', async () => {
  const data = fixture([actor])
  await assert.rejects(loadPlayer('TTB-ATH-000002', data.read), error => error.code === 'not_found')
  assert.equal(data.calls.length, 2)
  assert.ok(data.calls.every(call => call.book === 'acteurs'))
})
test('missing fields and duplicate IDs are schema errors; rows never silently disappear', async () => {
  await assert.rejects(loadPlayers(fixture([actor, actor]).read), error => error.code === 'schema')
  await assert.rejects(loadPlayer(actor.id_athlete, fixture([actor, actor]).read), error => error.code === 'schema')
  await assert.rejects(loadPlayers(fixture([{ ...actor, id_athlete: '' }]).read), error => error.code === 'schema')
  assert.throws(() => projection('ATHLETES', [['nom_complet']], ['id_athlete'], []), error => error.code === 'schema')
  assert.throws(() => projection('ATHLETES', [['id_athlete', 'id_athlete']], ['id_athlete'], []), error => error.code === 'schema')
})
test('network errors remain errors and never return an empty list or leak SDK details', async () => {
  await assert.rejects(loadPlayers(async () => { throw new Error('PRIVATE-CREDENTIAL') }), error => error instanceof PlayerReadError && error.code === 'connection' && !error.message.includes('PRIVATE'))
})
test('blank affiliation/status and optional ITTF stay blank, without a licence inference', async () => {
  const players = await loadPlayers(fixture([{ ...actor, date_affiliation: '', statut: '' }]).read)
  assert.equal(players[0].affiliation, ''); assert.equal(players[0].status, ''); assert.equal(players[0].ittf, '')
  assert.equal(Object.hasOwn(players[0], 'licence'), false)
})
test('FORMATS_ID must explicitly confirm the permanent TTB player identifier', async () => {
  const data = fixture([actor])
  data.source.referentiel.FORMATS_ID[1][1] = 'BWF-ATH-######'
  await assert.rejects(loadPlayers(data.read), error => error.code === 'schema')
})
test('configuration requires four actor variables, rejects foreign books and has no fallback', () => {
  assert.throws(() => configuration({}, ['acteurs', 'referentiel']), error => error.code === 'configuration' && error.message.includes('GOOGLE_PRIVATE_KEY'))
  const values = { GOOGLE_CLIENT_EMAIL: 'test@example.test', GOOGLE_PRIVATE_KEY: 'test-key', FCTT_ACTEURS_SPREADSHEET_ID: books.acteurs.id, FCTT_REFERENTIELS_SPREADSHEET_ID: books.referentiel.id }
  assert.equal(configuration(values, ['acteurs', 'referentiel']).email, 'test@example.test')
  assert.throws(() => configuration({ ...values, FCTT_ACTEURS_SPREADSHEET_ID: 'BWF-source' }, ['acteurs', 'referentiel']), error => error.code === 'configuration')
})
test('local-only reads reject foreign and conflicting forwarded authorities', () => {
  assert.equal(localReadAccess(new Request('http://127.0.0.1:3049/api/athletes')), true)
  assert.equal(localReadAccess(new Request('https://example.com/api/athletes')), false)
  assert.equal(localReadAccess(new Request('http://127.0.0.1:3049/api/athletes', { headers: { host: '127.0.0.1:3049', 'x-forwarded-host': 'example.com' } })), false)
})
