import "server-only"
import { env } from "@/lib/env"
import { getSheetsDataFrom, type SheetRow } from "@/lib/google-sheets"
import type { SeasonOptionViewModel, SystemSettingsViewModel, UserProfileViewModel } from "@/lib/settings-domain"
const text = (row: SheetRow | undefined, key: string) => String(row?.[key] ?? "").trim()
export async function loadSettings(): Promise<{ profile: UserProfileViewModel; settings: SystemSettingsViewModel; error: string }> {
  const profile: UserProfileViewModel = { fullName: "Utilisateur" }
  try {
    const data = await getSheetsDataFrom(env.googleSheets.referentielsSpreadsheetId, ["SAISON!A:Z", "STATUTS_SAISON!A:Z", "PARAMETRES_SYSTEME!A:Z"])
    const statuses = new Map((data.STATUTS_SAISON ?? []).map((row) => [text(row, "id_statut_saison"), text(row, "nom_statut_saison") || text(row, "nom_statut")]))
    const seasons: SeasonOptionViewModel[] = (data.SAISON ?? []).map((row) => { const statusId = text(row, "id_statut_saison"); const statusLabel = statuses.get(statusId) || statusId; return { id: text(row, "id_saison"), label: text(row, "nom_saison") || text(row, "id_saison"), startDate: text(row, "date_debut"), endDate: text(row, "date_fin"), statusId, statusLabel, disabled: statusLabel.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() === "ANNULEE" } }).filter((season) => season.id)
    const parameter = (data.PARAMETRES_SYSTEME ?? []).find((row) => text(row, "cle_parametre") === "SAISON_COURANTE")
    const currentSeasonId = text(parameter, "valeur_parametre")
    return { profile, settings: { currentSeasonId, currentSeason: seasons.find((season) => season.id === currentSeasonId), availableSeasons: seasons, lastUpdatedAt: text(parameter, "date_modification"), lastUpdatedBy: text(parameter, "modifie_par"), persistenceAvailable: false, seasonsAvailable: true }, error: "" }
  } catch (error) { return { profile, settings: { availableSeasons: [], persistenceAvailable: false, seasonsAvailable: false }, error: error instanceof Error ? error.message : "Impossible de charger les saisons disponibles." } }
}
