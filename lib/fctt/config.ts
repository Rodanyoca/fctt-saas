// @ts-expect-error Native Node tests require the explicit extension.
import { PlayerReadError } from './players-domain.ts'
export const books = {
  referentiel: { variable: 'FCTT_REFERENTIELS_SPREADSHEET_ID', id: '15YIULm6mASxqi7PPOA7HaxDr7N5fgpJ2FTu9zvnEhkU' },
  acteurs: { variable: 'FCTT_ACTEURS_SPREADSHEET_ID', id: '16ygu-GXAzlzOa7O-F40ghq8NEQEAVqqG8hd9oSzIPuU' },
  competitions: { variable: 'FCTT_COMPETITIONS_SPREADSHEET_ID', id: '1uuYY-tOrury2LNxkbBuM6VPji0kHfysxz5Gbu98H6rs' },
  activites: { variable: 'FCTT_ACTIVITES_SPREADSHEET_ID', id: '14BRt8HthoM8zgp1MzgwJ02AX57i-8pkySh252b8BFl4' },
  documents: { variable: 'FCTT_DOCUMENTS_SPREADSHEET_ID', id: '1XtIua10txcZteKQps8SLcFC7JKTn5Fh0iLQ55ndIn4k' },
} as const
export function configuration(values: Record<string, string | undefined>, requested: (keyof typeof books)[]) {
  const names = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', ...requested.map(book => books[book].variable)]
  const missing = names.filter(name => !values[name]?.trim())
  if (missing.length) throw new PlayerReadError('configuration', `Configuration manquante : ${missing.join(', ')}. À renseigner dans .env.local.`)
  for (const book of requested) if (values[books[book].variable]?.trim() !== books[book].id) throw new PlayerReadError('configuration', `Cible FCTT incorrecte : ${books[book].variable}. Aucun autre classeur ne sera utilisé.`)
  return { email: values.GOOGLE_CLIENT_EMAIL!.trim(), key: values.GOOGLE_PRIVATE_KEY!.trim().replace(/\\n/g, '\n') }
}
