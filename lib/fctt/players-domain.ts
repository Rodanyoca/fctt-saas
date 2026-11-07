export type Matrix = unknown[][]
export type Read = (book: 'acteurs' | 'referentiel', ranges: string[], fresh?: boolean) => Promise<Record<string, Matrix>>
export type Player = { id: string; ittf: string; name: string; sex: string; nationality: string; affiliation: string; status: string }
export type PlayerDetail = Player & { birth: string; birthplace: string; telephone: string; email: string; address: string }
export class PlayerReadError extends Error {
  code: 'configuration' | 'connection' | 'schema' | 'not_found'
  constructor(code: PlayerReadError['code'], message: string) { super(message); this.code = code }
}
export const listFields = ['id_athlete', 'nom_complet', 'id_sexe', 'nationalite', 'date_affiliation', 'statut', 'id_ittf']
const requiredFields = ['id_athlete', 'nom_complet', 'id_sexe', 'date_affiliation', 'statut']
const detailFields = [...listFields, 'date_naissance', 'lieu_naissance', 'telephone', 'email', 'adresse']
export function columnName(index: number) {
  let result = ''
  for (let value = index + 1; value; value = Math.floor((value - 1) / 26)) result = String.fromCharCode(65 + (value - 1) % 26) + result
  return result
}
export function projection(sheet: string, header: Matrix, required: string[], optional: string[]) {
  const names = (header[0] ?? []).map(cell => String(cell ?? '').trim())
  for (const name of required) if (names.filter(value => value === name).length !== 1) throw new PlayerReadError('schema', `Schéma ${sheet} incompatible : colonne ${name} absente ou dupliquée.`)
  return [...new Set([...required, ...optional])].flatMap(field => {
    const index = names.indexOf(field)
    if (index < 0) return []
    if (names.lastIndexOf(field) !== index) throw new PlayerReadError('schema', `Schéma ${sheet} incompatible : colonne ${field} dupliquée.`)
    const column = columnName(index)
    return [{ field, column, range: `'${sheet}'!${column}2:${column}` }]
  })
}
function rows(plan: ReturnType<typeof projection>, data: Record<string, Matrix>) {
  if (plan.some(field => !data[field.range])) throw new PlayerReadError('connection', 'Réponse Google Sheets incomplète.')
  const count = Math.max(0, ...plan.map(field => data[field.range].length))
  return Array.from({ length: count }, (_, index) => Object.fromEntries(plan.map(field => [field.field, String(data[field.range][index]?.[0] ?? '').trim()])))
}
async function reference(sheet: string, required: string[], read: Read) {
  const headerRange = `'${sheet}'!1:1`
  const header = (await read('referentiel', [headerRange]))[headerRange] ?? []
  const plan = projection(sheet, header, required, [])
  return rows(plan, await read('referentiel', plan.map(field => field.range)))
}
async function references(read: Read) {
  const [sexes, statuses, formats] = await Promise.all([
    reference('SEXES', ['id_sexe', 'nom_sexe'], read),
    reference('STATUTS_ACTEURS', ['id_statut_acteur', 'nom_statut_acteur'], read),
    reference('FORMATS_ID', ['objet', 'format_propose'], read),
  ])
  const athlete = formats.filter(row => row.objet === 'ATHLETE')
  if (athlete.length !== 1 || athlete[0].format_propose !== 'TTB-ATH-######') throw new PlayerReadError('schema', 'FORMATS_ID ne confirme pas le format FCTT TTB-ATH-######.')
  return { sexes: new Map(sexes.map(row => [row.id_sexe, row.nom_sexe])), statuses: new Map(statuses.map(row => [row.id_statut_acteur, row.nom_statut_acteur])) }
}
function player(row: Record<string, string>, refs: Awaited<ReturnType<typeof references>>): Player {
  if (!/^TTB-ATH-\d{6}$/.test(row.id_athlete)) throw new PlayerReadError('schema', 'ATHLETES contient un identifiant fédéral absent ou incompatible avec FORMATS_ID.')
  return { id: row.id_athlete, ittf: row.id_ittf || '', name: row.nom_complet || '', sex: refs.sexes.get(row.id_sexe) || row.id_sexe || '', nationality: row.nationalite || '', affiliation: row.date_affiliation || '', status: refs.statuses.get(row.statut) || row.statut || '' }
}
async function guarded<T>(load: () => Promise<T>) {
  try { return await load() } catch (error) {
    if (error instanceof PlayerReadError) throw error
    // SDK errors may contain request credentials and private metadata: never forward them.
    throw new PlayerReadError('connection', 'Lecture Google Sheets FCTT impossible. Vérifiez le réseau et les droits du compte de service.')
  }
}
export async function loadPlayers(read: Read): Promise<Player[]> {
  return guarded(async () => {
    const headerRange = "'ATHLETES'!1:1"
    const [header, refs] = await Promise.all([read('acteurs', [headerRange]), references(read)])
    const plan = projection('ATHLETES', header[headerRange] ?? [], requiredFields, listFields)
    const projected = rows(plan, await read('acteurs', plan.map(field => field.range)))
    const seen = new Set<string>()
    return projected.filter(row => Object.values(row).some(Boolean)).map(row => {
      const result = player(row, refs)
      if (seen.has(result.id)) throw new PlayerReadError('schema', 'ATHLETES contient un identifiant fédéral dupliqué.')
      seen.add(result.id)
      return result
    })
  })
}
export async function loadPlayer(id: string, read: Read): Promise<PlayerDetail> {
  return guarded(async () => {
    if (!/^TTB-ATH-\d{6}$/.test(id)) throw new PlayerReadError('not_found', 'Joueur FCTT introuvable.')
    const headerRange = "'ATHLETES'!1:1"
    const header = (await read('acteurs', [headerRange], true))[headerRange] ?? []
    const plan = projection('ATHLETES', header, requiredFields, detailFields)
    const identity = plan.find(field => field.field === 'id_athlete')!
    const identifiers = (await read('acteurs', [identity.range], true))[identity.range]
    if (!identifiers) throw new PlayerReadError('connection', 'Réponse Google Sheets incomplète.')
    const matches = identifiers.flatMap((row, index) => String(row[0] ?? '').trim() === id ? [index + 2] : [])
    if (matches.length === 0) throw new PlayerReadError('not_found', 'Joueur FCTT introuvable.')
    if (matches.length !== 1) throw new PlayerReadError('schema', 'Identifiant de joueur dupliqué : lecture de la fiche refusée.')
    // Locate the actor first, then request only the permitted cells of that exact row.
    const cells = plan.map(field => ({ ...field, range: `'ATHLETES'!${field.column}${matches[0]}` }))
    const [data, refs] = await Promise.all([read('acteurs', cells.map(field => field.range), true), references(read)])
    if (cells.some(field => !data[field.range])) throw new PlayerReadError('connection', 'Réponse Google Sheets incomplète.')
    const row = Object.fromEntries(cells.map(field => [field.field, String(data[field.range][0]?.[0] ?? '').trim()]))
    if (row.id_athlete !== id) throw new PlayerReadError('schema', 'La ligne du joueur a changé. Rechargez la fiche.')
    return { ...player(row, refs), birth: row.date_naissance || '', birthplace: row.lieu_naissance || '', telephone: row.telephone || '', email: row.email || '', address: row.adresse || '' }
  })
}
