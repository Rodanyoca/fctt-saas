import 'server-only'
import { books, configuration } from './config'
import { PlayerReadError, type Matrix, type Read } from './players-domain'
const pending = new Map<string, Promise<Record<string, Matrix>>>()
const cached = new Map<string, { data: Record<string, Matrix>; until: number }>()
const queued = new Map<string, { book: 'acteurs' | 'referentiel'; ranges: Set<string>; requests: Array<{ resolve: (data: Record<string, Matrix>) => void; reject: (error: unknown) => void }> }>()
async function batch(book: 'acteurs' | 'referentiel', ranges: string[]) {
  const config = configuration(process.env, ['acteurs', 'referentiel'])
  try {
    const { sheets, auth: authClient } = await import('googleapis/build/src/apis/sheets')
    const auth = new authClient.JWT({ email: config.email, key: config.key, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] })
    const response = await sheets({ version: 'v4', auth }).spreadsheets.values.batchGet({ spreadsheetId: books[book].id, ranges, valueRenderOption: 'FORMATTED_VALUE', fields: 'valueRanges(values)' }, { timeout: 15000, retry: false })
    if (response.data.valueRanges?.length !== ranges.length) throw new Error('Incomplete source response')
    return Object.fromEntries(ranges.map((range, index) => [range, response.data.valueRanges![index].values ?? []]))
  } catch { throw new PlayerReadError('connection', 'Connexion Google Sheets FCTT indisponible. Vérifiez le réseau et les droits du compte de service.') }
}
// Merge reference header/projection requests launched together into one batch per book.
function grouped(book: 'acteurs' | 'referentiel', ranges: string[]) {
  return new Promise<Record<string, Matrix>>((resolve, reject) => {
    let group = queued.get(book)
    if (!group) {
      group = { book, ranges: new Set(), requests: [] }; queued.set(book, group)
      setTimeout(() => {
        const current = queued.get(book)!
        queued.delete(book)
        void batch(book, [...current.ranges]).then(data => current.requests.forEach(request => request.resolve(data)), error => current.requests.forEach(request => request.reject(error)))
      }, 0)
    }
    ranges.forEach(range => group.ranges.add(range)); group.requests.push({ resolve, reject })
  })
}
export const readFcttSheets: Read = async (book, requested, fresh = false) => {
  configuration(process.env, ['acteurs', 'referentiel'])
  const ranges = [...new Set(requested)].sort(), key = JSON.stringify([book, ranges])
  if (!fresh && cached.get(key) && cached.get(key)!.until > Date.now()) return cached.get(key)!.data
  if (!fresh && pending.has(key)) return pending.get(key)!
  const promise = grouped(book, ranges).then(data => {
    const result = Object.fromEntries(ranges.map(range => [range, data[range]]))
    if (!fresh) cached.set(key, { data: result, until: Date.now() + 15000 })
    return result
  }).finally(() => { if (!fresh) pending.delete(key) })
  if (!fresh) pending.set(key, promise)
  return promise
}
