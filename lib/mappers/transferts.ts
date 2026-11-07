import type { SheetRow } from "@/lib/google-sheets"
import type { Transfert } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return v === null || v === undefined ? "" : String(v).trim()
}

function first(row: SheetRow, keys: string[]): string {
  for (const key of keys) {
    const value = str(row, key)
    if (value) return value
  }
  return ""
}

function normalizeStatut(raw: string): string {
  const value = raw.trim().toLowerCase()
  if (value === "valide" || value === "validé" || value === "validee" || value === "validée") return "valide"
  if (value === "en attente" || value === "attente") return "en attente"
  if (value === "rejete" || value === "rejeté" || value === "refuse" || value === "refusé") return "rejete"
  return raw.trim()
}

export function mapTransfertRow(row: SheetRow): Transfert {
  return {
    id: first(row, ["id_transfert", "matricule", "numero_transfert"]),
    athleteId: first(row, ["id_athlete", "matricule_athlete", "id_ancien_athlete"]),
    athleteNom: first(row, ["nom_athlete", "nom_complet", "athlete"]),
    clubOrigineId: first(row, ["id_club_origine"]),
    clubOrigineNom: first(row, ["nom_club_origine"]),
    clubBeneficiaireId: first(row, ["id_club_destination", "id_club_beneficiaire"]),
    clubBeneficiaireNom: first(row, [
      "nom_club_destination",
      "nom_club_beneficiare",
      "nom_club_beneficiaire",
    ]),
    typeTransfert: first(row, ["type_de_transfert", "type_transfert"]),
    saison: first(row, ["saison"]),
    statut: normalizeStatut(first(row, ["statut_transfert", "statut"])),
    dateValidation: first(row, ["date_de_validation", "date_validation"]),
    dateDebut: first(row, ["date_debut", "date_de_début", "date_debut_transfert"]),
    dateFin: first(row, ["date_fin", "date_de_fin", "date_fin_transfert"]),
    observation: first(row, ["observation", "observations"]),
  }
}
