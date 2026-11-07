import type { SheetRow } from "@/lib/google-sheets"
import type { CompetitionResult } from "@/lib/types"
import { enrichCompetitionResult } from "@/lib/competition-calculations"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return v === null || v === undefined ? "" : String(v).trim()
}

function num(row: SheetRow, key: string): number | null {
  const value = row[key]
  if (value === null || value === undefined || value === "") return null
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? null : numberValue
}

function normalizeDiscipline(raw: string): string {
  const v = raw.trim().toUpperCase()
  if (v === "INDOOR") return "INDOOR"
  if (v === "BEACH") return "BEACH"
  return raw.trim()
}

export function mapCompetitionResultRow(row: SheetRow): CompetitionResult {
  return enrichCompetitionResult({
    idResultat: str(row, "id_resultat"),
    idCompetition: str(row, "id_competition"),
    nomCompetition: str(row, "nom_competition"),
    discipline: normalizeDiscipline(str(row, "discipline")),
    saison: str(row, "saison"),
    dateMatch: str(row, "date_match"),
    heureMatch: str(row, "heure_match"),
    lieuMatch: str(row, "lieu_match"),
    classementPoule: str(row, "classement_poule"),
    phase: str(row, "phase") || str(row, "classement_poule"),
    poule: str(row, "poule"),
    idUniteA: str(row, "id_unite_a"),
    nomUniteA: str(row, "nom_unite_a"),
    idUniteB: str(row, "id_unite_b"),
    nomUniteB: str(row, "nom_unite_b"),
    scoreGlobal: str(row, "score_global"),
    set1A: num(row, "set_1_a"), set1B: num(row, "set_1_b"),
    set2A: num(row, "set_2_a"), set2B: num(row, "set_2_b"),
    set3A: num(row, "set_3_a"), set3B: num(row, "set_3_b"),
    set4A: num(row, "set_4_a"), set4B: num(row, "set_4_b"),
    set5A: num(row, "set_5_a"), set5B: num(row, "set_5_b"),
    setsGagnesA: num(row, "sets_gagnes_a"),
    setsGagnesB: num(row, "sets_gagnes_b"),
    totalPointA: num(row, "total_point_a"),
    totalPointB: num(row, "total_point_b"),
    pointsClassementA: num(row, "points_classement_a"),
    pointsClassementB: num(row, "points_classement_b"),
    idUniteVainqueur: str(row, "id_unite_vainquer") || str(row, "id_unite_vainqueur"),
    nomUniteVainqueur: str(row, "nom_unite_vainqueur"),
    forfait: str(row, "forfait"),
    vainqueur: str(row, "vainqueur"),
    statutMatch: str(row, "statut_match"),
    observation: str(row, "observation"),
  })
}
