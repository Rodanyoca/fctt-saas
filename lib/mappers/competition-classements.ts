import type { SheetRow } from "@/lib/google-sheets"
import type { CompetitionClassement } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const value = row[key]
  return value === null || value === undefined ? "" : String(value).trim()
}

function first(row: SheetRow, keys: string[]): string {
  for (const key of keys) {
    const value = str(row, key)
    if (value) return value
  }
  return ""
}

function num(row: SheetRow, key: string): number | null {
  const value = row[key]
  if (value === null || value === undefined || value === "") return null
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? null : numberValue
}

function normalizeDiscipline(raw: string): string {
  const value = raw.trim().toUpperCase()
  if (value === "INDOOR") return "INDOOR"
  if (value === "BEACH") return "BEACH"
  return raw.trim()
}

export function mapCompetitionClassementRow(row: SheetRow): CompetitionClassement {
  return {
    idClassement: str(row, "id_classement"),
    coteUnite: str(row, "cote_unite"),
    idResultat: str(row, "id_resultat"),
    idCompetition: str(row, "id_competition"),
    nomCompetition: str(row, "nom_competition"),
    discipline: normalizeDiscipline(str(row, "discipline")),
    saison: str(row, "saison"),
    phase: str(row, "phase"),
    poule: str(row, "poule"),
    idUnite: str(row, "id_unite"),
    nomUnite: str(row, "nom_unite"),
    idAdversaire: str(row, "id_adversaire"),
    nomAdversaire: str(row, "nom_adversaire"),
    scoreGlobal: str(row, "score_global"),
    resultatMatch: str(row, "resultat_match"),
    setsGagnes: num(row, "sets_gagnes"),
    setsPerdus: num(row, "sets_perdues"),
    pointsGagnes: num(row, "points_gagnes"),
    pointsPerdus: num(row, "points_perdus"),
    pointsClassement: num(row, "points_classement"),
    matchJoue: num(row, "match_joues"),
    matchGagne: num(row, "match_gagnes"),
    matchPerdu: num(row, "match_perdus"),
    matchsJoues: num(row, "match_joues") ?? 0,
    matchsGagnes: num(row, "match_gagnes") ?? 0,
    matchsPerdus: num(row, "match_perdus") ?? 0,
    pointsMarques: num(row, "point_marques") ?? 0,
    pointsEncaisses: num(row, "points_encaisses") ?? 0,
    ratioSets: num(row, "ratio_sets") ?? 0,
    ratioPoints: num(row, "ratio_points") ?? 0,
    rang: num(row, "rang"),
    observation: str(row, "observation"),
    typeUnite: str(row, "type_unite"),
    adversaire: first(row, ["nom_adversaire", "adversaire"]),
    differenceSets: num(row, "difference_sets"),
    differencePoints: num(row, "difference_points"),
  }
}
