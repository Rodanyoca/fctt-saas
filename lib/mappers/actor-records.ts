import { asText } from "@/lib/sheet-values"
import { athleteAffiliationClubId, athleteAffiliationClubName } from "@/lib/athlete-affiliation-fields"
import type {
  AthleteAffiliation,
  AthleteLicence,
  BaseActorAffiliation,
  BaseActorLicence,
  CoachAffiliation,
  MedecinAffiliation,
  OfficielAffiliation,
} from "@/lib/types"

type Row = Record<string, unknown>
type ActorKind = "athlete" | "coach" | "medecin" | "officiel" | "arbitre"

export const normalizeId = (value: unknown) => asText(value)

function first(row: Row, ...keys: string[]) {
  for (const key of keys) {
    const value = asText(row[key])
    if (value) return value
  }
  return ""
}

const actorKeys: Record<ActorKind, string[]> = {
  athlete: ["id_athlete", "athlete_id", "id_acteur"],
  coach: ["id_coach", "coach_id", "id_acteur"],
  medecin: ["id_medecin", "medecin_id", "id_acteur"],
  officiel: ["id_officiel", "officiel_id", "id_acteur"],
  arbitre: ["id_arbitre", "arbitre_id", "id_acteur"],
}

function baseAffiliation(row: Row, kind: Exclude<ActorKind, "arbitre">): BaseActorAffiliation {
  return {
    idAffiliation: normalizeId(first(row, `id_affiliation_${kind}`, "id_affiliation")),
    actorId: normalizeId(first(row, ...actorKeys[kind])),
    actorName: first(row, `nom_${kind}`, "nom_complet", "nom_acteur"),
    idStructure: normalizeId(first(row, "id_structure", "id_club", "id_ligue", "id_entente")),
    nomStructure: first(row, "nom_structure", "nom_club", "nom_ligue", "nom_entente"),
    dateDebut: first(row, "date_debut"),
    dateFin: first(row, "date_fin"),
    statutAffiliation: first(row, "id_statut_affiliation", "statut_affiliation", "statut"),
    observation: first(row, "observation", "observations"),
  }
}

export function mapAthleteAffiliation(row: Row): AthleteAffiliation {
  return {
    ...baseAffiliation(row, "athlete"),
    saison: first(row, "saison"),
    typeAffiliation: first(row, "type_affiliation", "type_mouvement", "type_transfert"),
    idClubOrigine: normalizeId(first(row, "id_club_origine")),
    nomClubOrigine: first(row, "nom_club_origine"),
    idClubBeneficiaire: normalizeId(athleteAffiliationClubId(row)),
    nomClubBeneficiaire: athleteAffiliationClubName(row),
  }
}

export const mapCoachAffiliation = (row: Row): CoachAffiliation => ({
  ...baseAffiliation(row, "coach"),
  saison: first(row, "saison"),
  typeAffiliation: first(row, "type_affiliation"),
  fonction: first(row, "fonction", "role"),
})

export const mapMedecinAffiliation = (row: Row): MedecinAffiliation => ({
  ...baseAffiliation(row, "medecin"),
  saison: first(row, "saison"),
  typeAffiliation: first(row, "type_affiliation"),
  fonction: first(row, "fonction", "role"),
})

export const mapOfficielAffiliation = (row: Row): OfficielAffiliation => ({
  ...baseAffiliation(row, "officiel"),
  idAffiliation: normalizeId(first(row, "id_affiliation_officiel", "id_mandat")),
  idTypeActeur: normalizeId(first(row, "id_type_acteur")),
  idFonction: normalizeId(first(row, "id_fonction")),
  idTypeStructure: normalizeId(first(row, "id_type_entite", "id_type_structure")),
  idSaison: normalizeId(first(row, "id_saison")),
  typeStructure: first(row, "nom_type_structure"),
  saison: first(row, "nom_saison"),
  fonction: first(row, "nom_fonction", "fonction", "role"),
  statutAffiliation: first(row, "id_statut_affiliation", "statut_mandat", "statut"),
})

export function mapLicence(row: Row, kind: ActorKind): BaseActorLicence {
  return {
    idLicence: normalizeId(first(row, "id_licence")),
    numeroLicence: first(row, "numero_licence", "num_licence"),
    actorId: normalizeId(first(row, ...actorKeys[kind])),
    actorName: first(row, `nom_${kind}`, "nom_complet", "nom_acteur"),
    dateDelivrance: first(row, "date_de_delivrance", "date_delivrance"),
    dateDebutValidite: first(row, "date_debut_validite"),
    dateFinValidite: first(
      row,
      "date_de_fin_validite",
      "date_fin_validite",
      "date_expiration",
    ),
    statutLicence: first(row, "id_statut_licence", "statut_licence", "statut"),
    idStatutLicence: normalizeId(first(row, "id_statut_licence")),
    idCycleLicence: normalizeId(first(row, "id_cycle_licence")),
    idAffiliationActeur: normalizeId(first(row, "id_affiliation_acteur")),
    idLicencePrecedente: normalizeId(first(row, "id_licence_precedente")),
    numeroLicencePrecedente: first(row, "numero_licence_precedente"),
  }
}

export function mapAthleteLicence(row: Row): AthleteLicence {
  return {
    ...mapLicence(row, "athlete"),
    saison: first(row, "id_saison", "saison"),
    idAffiliation: normalizeId(first(row, "id_affiliation_athlete", "id_affiliation")),
    idClub: normalizeId(first(row, "id_club")),
    nomClub: first(row, "nom_club"),
  }
}
