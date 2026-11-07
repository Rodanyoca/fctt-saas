import type { Medecin } from "@/lib/types"
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

export function mapMedecinRow(row: SheetRow): Medecin {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    idMedecin: str(row, "id_medecin"),
    idSexe: str(row, "id_sexe"),
    idSpecialite: str(row, "id_specialite") || str(row, "id_specialite_sante"),
    idNational: str(row, "id_national"),
    idFivb: str(row, "id_fivb"),
    sexe: str(row, "nom_sexe") || str(row, "sexe"),
    dateDeNaissance: str(row, "date_naissance") || str(row, "date_de_naissance"),
    nationalite: str(row, "nationalite"),
    avatarDriveId: str(row, "avatar_drive_id"),
    avatarDriveUrl: str(row, "avatar_drive_url"),
    id: str(row, "id_medecin"),
    nomComplet: str(row, "nom_complet") || str(row, "nom"),
    dateNaissance: str(row, "date_naissance") || str(row, "date_de_naissance"),
    genre: str(row, "nom_sexe") || str(row, "sexe"),
    specialite: str(row, "nom_specialite") || (str(row, "id_specialite") || str(row, "id_specialite_sante") ? "Spécialité inconnue" : ""),
    niveau: str(row, "niveau"),
    telephone: str(row, "telephone"),
    email: str(row, "email"),
    adresse: str(row, "adresse"),
    numeroPasseport: str(row, "numéro_passeport") || str(row, "numero_passeport"),
    dateDelivrancePasseport: str(row, "date_de_delivrance_passeport") || str(row, "date_delivrance_passeport"),
    dateExpirationPasseport: str(row, "date_expiration_passeport") || str(row, "date_expiration passeport"),
    passeportDriveId: str(row, "passeport_drive_id"),
    passeportDriveUrl: str(row, "passeport_drive_url"),
    numeroOrdre: str(row, "numero_ordre"),
    equipeNationale: str(row, "equipe_nationale"),
    provinceId: "",
    provinceNom: "",
    ligueId: "",
    ligueNom: "",
    ententeId: "",
    ententeNom: "",
    pseudoEntente: "",
    clubId: "",
    clubNom: "",
    equipeId: "",
    equipeNom: "",
    dateAffiliation: str(row, "date_affiliation"),
    statut: normalizeStatut(statutRaw),
    affiliations: [],
  }
}
