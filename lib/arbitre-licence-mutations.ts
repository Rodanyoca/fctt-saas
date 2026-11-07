import "server-only"

import { env } from "@/lib/env"
import { getArbitreLicences } from "@/lib/actor-records"
import { licenceHistory } from "@/lib/actor-record-utils"
import { getArbitres } from "@/lib/data"
import { appendReplacingLicence } from "@/lib/licence-write"
import { assertDateOrder, assertValidDate } from "@/lib/date-validation"

const text = (value: unknown) => String(value ?? "").trim()
const statuses = new Set(["actif", "active", "inactif", "inactive", "en attente", "expire", "expiré"])

function nextLicenceId(existingIds: string[]) {
  const pattern = /^LI\.ARBITRE-(\d{6})$/i
  const max = existingIds.reduce((highest, id) => {
    const match = id.match(pattern)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 0)
  return `LI.ARBITRE-${String(max + 1).padStart(6, "0")}`
}

export async function createArbitreLicence(idArbitre: string, payload: Record<string, unknown>) {
  const numeroLicence = text(payload.numeroLicence)
  const dateDelivrance = text(payload.dateDelivrance)
  const dateFinValidite = text(payload.dateFinValidite)
  const statutLicence = text(payload.statutLicence).toLowerCase() || "actif"

  if (!numeroLicence) throw new Error("Le numéro de licence est obligatoire.")
  assertValidDate(dateDelivrance, "La date de délivrance", true)
  assertValidDate(dateFinValidite, "La date de fin de validité", true)
  assertDateOrder(dateDelivrance, dateFinValidite, "La fin de validité doit être postérieure à la délivrance.")
  if (!statuses.has(statutLicence)) throw new Error("Le statut de la licence est invalide.")

  const [arbitres, licences] = await Promise.all([getArbitres(), getArbitreLicences()])
  const arbitre = arbitres.find((item) => item.idArbitre === idArbitre)
  if (!arbitre) throw new Error("Arbitre introuvable.")
  if (licences.some((item) => item.numeroLicence.toLowerCase() === numeroLicence.toLowerCase())) {
    throw new Error("Ce numéro de licence existe déjà.")
  }

  const idLicence = nextLicenceId(licences.map((item) => item.idLicence))
  const previous = licenceHistory(licences, arbitre.idArbitre)[0]
  await appendReplacingLicence({
    spreadsheetId: env.googleSheets.affiliationsSpreadsheetId,
    sheetName: "ARBITRES_LICENCES",
    previous,
    record: {
      id_licence: idLicence,
      numero_licence: numeroLicence,
      id_arbitre: arbitre.idArbitre,
      nom_arbitre: arbitre.nomComplet,
      date_de_delivrance: dateDelivrance,
      date_de_fin_validite: dateFinValidite,
      statut_licence: statutLicence,
    },
  })

  return {
    deactivatedLicenceId: previous?.idLicence ?? "",
    licence: {
      idLicence, numeroLicence, actorId: arbitre.idArbitre, actorName: arbitre.nomComplet,
      dateDelivrance, dateFinValidite, statutLicence,
      idLicencePrecedente: previous?.idLicence ?? "",
      numeroLicencePrecedente: previous?.numeroLicence ?? "",
    },
  }
}
