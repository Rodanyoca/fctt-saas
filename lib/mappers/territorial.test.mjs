import assert from "node:assert/strict"
import test from "node:test"

import { mapClubRow } from "./clubs.ts"
import { mapEntenteRow } from "./ententes.ts"
import { mapLigueRow } from "./ligues.ts"

test("mappe les colonnes du nouveau référentiel LIGUES", () => {
  const ligue = mapLigueRow({
    id_ligue: "ligue-id", id_ligue_coc: "ligue-coc", nom_ligue: "ligue-nom",
    sigle_ligue: "ligue-sigle", "année_creation": "creation-annee",
    date_affiliation_ligue: "affiliation-date", email: "ligue-email",
    telephone: "ligue-telephone", id_province: "province-id",
    statut: "ACTIF", observations: "ligue-observations",
  })
  assert.deepEqual(
    [ligue.idLigue, ligue.idLigueCoc, ligue.nomLigue, ligue.sigleLigue, ligue.anneeCreation, ligue.dateAffiliation, ligue.emailLigue, ligue.telephone, ligue.idProvince, ligue.statut, ligue.observations],
    ["ligue-id", "ligue-coc", "ligue-nom", "ligue-sigle", "creation-annee", "affiliation-date", "ligue-email", "ligue-telephone", "province-id", "active", "ligue-observations"],
  )
})

test("mappe les colonnes du nouveau référentiel ENTENTES", () => {
  const entente = mapEntenteRow({
    id_entente: "entente-id", id_entente_coc: "entente-coc", id_ligue: "ligue-id",
    code_entente: "entente-code", nom_entente: "entente-nom", sigle_entente: "entente-sigle",
    date_creation: "creation-date", date_reconnaissance: "reconnaissance-date",
    id_ville: "ville-id", nom_ville: "Ville Entente", email: "entente-email", telephone: "entente-telephone",
    statut: "ACTIF", observations: "entente-observations",
  })
  assert.deepEqual(
    [entente.idEntente, entente.idEntenteCoc, entente.idLigue, entente.codeEntente, entente.nomEntente, entente.pseudoEntente, entente.dateCreation, entente.dateReconnaissance, entente.idVille, entente.ville, entente.emailEntente, entente.telephone, entente.statut, entente.observations],
    ["entente-id", "entente-coc", "ligue-id", "entente-code", "entente-nom", "entente-sigle", "creation-date", "reconnaissance-date", "ville-id", "Ville Entente", "entente-email", "entente-telephone", "active", "entente-observations"],
  )
})

test("mappe toutes les colonnes du nouveau référentiel CLUBS", () => {
  const row = {
    id_club: "club-id",
    id_club_coc: "club-coc",
    code_club: "club-code",
    id_ligue_historique: "ligue-historique",
    id_entente: "entente-id",
    nom_club: "club-nom",
    sigle_club: "club-sigle",
    id_categorie_club: "categorie-id",
    id_sexe: "sexe-id",
    date_creation: "creation-date",
    date_affiliation: "affiliation-date",
    id_ville: "ville-id",
    nom_ville: "Ville Club",
    email: "club-email",
    telephone: "club-telephone",
    statut: "ACTIF",
    observations: "club-observations",
    logo_drive_id: "logo-id",
    logo_drive_url: "logo-url",
  }

  const club = mapClubRow(row)

  assert.deepEqual(
    {
      idClub: club.idClub,
      idClubCoc: club.idClubCoc,
      codeClub: club.codeClub,
      idLigueHistorique: club.idLigueHistorique,
      idEntente: club.idEntente,
      nomClub: club.nomClub,
      sigleClub: club.sigleClub,
      idCategorieClub: club.idCategorieClub,
      idSexe: club.idSexe,
      dateCreation: club.dateCreation,
      dateAffiliationClub: club.dateAffiliationClub,
      idVille: club.idVille,
      ville: club.ville,
      email: club.email,
      telephone: club.telephone,
      statut: club.statut,
      observations: club.observations,
      logoDriveId: club.logoDriveId,
      logoDriveUrl: club.logoDriveUrl,
    },
    {
      idClub: "club-id",
      idClubCoc: "club-coc",
      codeClub: "club-code",
      idLigueHistorique: "ligue-historique",
      idEntente: "entente-id",
      nomClub: "club-nom",
      sigleClub: "club-sigle",
      idCategorieClub: "categorie-id",
      idSexe: "sexe-id",
      dateCreation: "creation-date",
      dateAffiliationClub: "affiliation-date",
      idVille: "ville-id",
      ville: "Ville Club",
      email: "club-email",
      telephone: "club-telephone",
      statut: "actif",
      observations: "club-observations",
      logoDriveId: "logo-id",
      logoDriveUrl: "logo-url",
    },
  )
})
