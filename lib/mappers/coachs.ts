import type { Coach } from "@/lib/types"
import type { SheetRow } from "@/lib/google-sheets"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  if (v === null || v === undefined) return ""
  return String(v).trim()
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "actif" || v === "active") return "actif"
  if (v === "inactif" || v === "inactive") return "inactif"
  return raw.trim()
}

export function mapCoachRow(row: SheetRow): Coach {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    idCoach: str(row, "id_coach"),
    idNational: str(row, "id_national"),
    idFivb: str(row, "id_fivb"),
    idSexe: str(row, "id_sexe"),
    sexe: str(row, "nom_sexe") || str(row, "sexe"),
    avatarDriveId: str(row, "avatar_drive_id"),
    avatarDriveUrl: str(row, "avatar_drive_url"),
    id: str(row, "id_coach"),
    nomComplet: str(row, "nom_complet"),
    dateNaissance: str(row, "date_naissance"),
    lieuNaissance: str(row, "lieu_naissance") || str(row, "lieu_de_naissance"),
    genre: str(row, "nom_sexe") || str(row, "sexe"),
    nationalite: str(row, "nationalite"),
    telephone: str(row, "telephone"),
    email: str(row, "email"),
    adresse: str(row, "adresse"),
    idNiveau: str(row, "id_niveau"),
    niveau: str(row, "nom_niveau_coach") || str(row, "niveau"),
    specialisation: str(row, "specialisation"),
    dateAffiliation: str(row, "date_affiliation"),
    statut: normalizeStatut(statutRaw),
  }
}
