// @ts-expect-error Node's transform-types runner requires an explicit TypeScript extension.
import { formatDateForSheet } from "./compact-date.ts"

export type NationalTeamInput = { id_discipline: string; nom_equipe_nationale: string; id_categorie_age: string; id_sexe: string; statut: string; observation: string }
const clean = (value: unknown) => String(value ?? "").trim()
export function validateNationalTeamInput(input: Record<string, unknown>) {
  const values: NationalTeamInput = { id_discipline: clean(input.id_discipline), nom_equipe_nationale: clean(input.nom_equipe_nationale), id_categorie_age: clean(input.id_categorie_age), id_sexe: clean(input.id_sexe), statut: clean(input.statut), observation: clean(input.observation) }
  const errors: Record<string, string> = {}
  if (!values.id_discipline) errors.id_discipline = "La discipline est obligatoire."
  if (!values.nom_equipe_nationale) errors.nom_equipe_nationale = "Le nom est obligatoire."
  if (!values.id_categorie_age) errors.id_categorie_age = "La catégorie est obligatoire."
  if (!values.id_sexe) errors.id_sexe = "Le sexe est obligatoire."
  if (!values.statut) errors.statut = "Le statut est obligatoire."
  return { values, errors }
}
export function functionalTeamKey(input: Pick<NationalTeamInput, "id_discipline" | "id_categorie_age" | "id_sexe">) { return [input.id_discipline, input.id_categorie_age, input.id_sexe].map((value) => clean(value).toUpperCase()).join("::") }
export function nextSequentialId(existing: string[], prefix: string, width: number) { const expression = new RegExp(`^${prefix}(\\d{${width}})$`, "i"); const max = existing.reduce((value, id) => { const match = id.match(expression); return match ? Math.max(value, Number(match[1])) : value }, 0); return `${prefix}${String(max + 1).padStart(width, "0")}` }
export function nextYearId(existing: string[], prefix: string, year: number, width: number) { const root = `${prefix}-${year}-`; const max = existing.filter((id) => id.startsWith(root)).reduce((value, id) => Math.max(value, Number(id.slice(root.length)) || 0), 0); return `${root}${String(max + 1).padStart(width, "0")}` }
export function validateDateRange(start: unknown, end: unknown, startRequired = true) { const errors: Record<string, string> = {}; let dateStart = clean(start), dateEnd = clean(end); if (startRequired && !dateStart) errors.date_debut = "La date de début est obligatoire."; try { dateStart = dateStart ? formatDateForSheet(dateStart) : "" } catch { errors.date_debut = "Date invalide (JJMMAAAA)." } try { dateEnd = dateEnd ? formatDateForSheet(dateEnd) : "" } catch { errors.date_fin = "Date invalide (JJMMAAAA)." } if (dateStart && dateEnd && dateEnd < dateStart) errors.date_fin = "La date de fin doit être postérieure ou égale à la date de début."; return { dateStart, dateEnd, errors } }
export function isActiveReference(row: Record<string, unknown>) { const status = clean(row.statut).toUpperCase(); return !status || status === "ACTIF" || status === "ACTIVE" }
