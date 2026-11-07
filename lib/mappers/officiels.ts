import type { Officiel } from "@/lib/types"
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

export function mapOfficielRow(row: SheetRow): Officiel {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    idOfficiel: str(row, "id_officiel"),
    idNational: str(row, "id_national"),
    idFivb: str(row, "id_fivb"),
    idSexe: str(row, "id_sexe"),
    sexe: str(row, "nom_sexe") || str(row, "sexe"),
    dateDeNaissance: str(row, "date_naissance") || str(row, "date_de_naissance"),
    nationalite: str(row, "nationalite"),
    avatarDriveId: str(row, "avatar_drive_id"),
    avatarDriveUrl: str(row, "avatar_drive_url"),
    id: str(row, "id_officiel"),
    nomComplet: str(row, "nom_complet"),
    dateNaissance: str(row, "date_naissance") || str(row, "date_de_naissance"),
    genre: str(row, "nom_sexe") || str(row, "sexe"),
    telephone: str(row, "telephone"),
    email: str(row, "email"),
    adresse: str(row, "adresse"),
    lieuNaissance: str(row, "lieu_de_naissance"),
    numeroPasseport: str(row, "numero_passeport") || str(row, "numéro_passeport"),
    dateDelivrancePasseport: str(row, "date_de_delivrance_passeport") || str(row, "date_delivrance_passeport"),
    dateExpirationPasseport: str(row, "date_expiration_passeport") || str(row, "date_expiration passeport"),
    observations: str(row, "observations"),
    passeportDriveId: str(row, "passeport_drive_id"),
    passeportDriveUrl: str(row, "passeport_drive_url"),
    fonction: "", entite: "", rattachement: "", dateNomination: "", dateFinMandat: "", equipeFederal: "",
    statut: normalizeStatut(statutRaw),
  }
}
