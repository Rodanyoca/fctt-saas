import type { Athlete } from "@/lib/types"
import type { SheetRow } from "@/lib/google-sheets"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return v === null || v === undefined ? "" : String(v).trim()
}

function num(row: SheetRow, key: string): number | null {
  const v = row[key]
  if (v === null || v === undefined || v === "") return null
  const n = typeof v === "number" ? v : Number(String(v))
  if (Number.isNaN(n)) return null
  return n
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "actif" || v === "active") return "actif"
  if (v === "inactif" || v === "inactive") return "inactif"
  if (v === "blesse" || v === "blessé") return "blesse"
  return raw.trim()
}

export function mapAthleteRow(row: SheetRow): Athlete {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    idAthlete: str(row, "id_athlete"),
    idNational: str(row, "id_national"),
    idFivb: str(row, "id_fivb"),
    idSexe: str(row, "id_sexe"),
    dateDeNaissance: str(row, "date_de_naissance"),
    sexe: str(row, "nom_sexe") || str(row, "sexe") || str(row, "id_sexe"),
    avatarDriveId: str(row, "avatar_drive_id"),
    avatarDriveUrl: str(row, "avatar_drive_url"),
    id: str(row, "id_athlete"),
    numeroOrdre: str(row, "numer_ordre_athlete") || str(row, "numero_ordre_athlete"),
    nomComplet: str(row, "nom_complet"),
    dateNaissance: str(row, "date_de_naissance"),
    lieuNaissance: str(row, "lieu_de_naissance"),
    genre: str(row, "nom_sexe") || str(row, "sexe") || str(row, "genre") || str(row, "id_sexe"),
    nationalite: str(row, "nationalite"),
    adresse: str(row, "adresse") || str(row, "adresse_athlete"),
    provinceId: str(row, "id_province"),
    provinceNom: str(row, "nom_province"),
    ligueId: str(row, "id_ligue"),
    ligueNom: str(row, "nom_ligue"),
    ententeId: str(row, "id_entente"),
    ententeNom: str(row, "nom_entente"),
    clubId: str(row, "id_club"),
    clubNom: str(row, "nom_club"),
    disciplineActive: str(row, "dicipline_active") || str(row, "discipline_active"),
    posteIndoor: str(row, "poste_indoor"),
    posteBeach: str(row, "poste_beach"),
    numero: str(row, "numero_maillot") || str(row, "numero"),
    taille: num(row, "taille"),
    poids: num(row, "poids"),
    telephone: str(row, "telephone"),
    email: str(row, "email"),
    observations: str(row, "observations"),
    statut: normalizeStatut(statutRaw),
  }
}
