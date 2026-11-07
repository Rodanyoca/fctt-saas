import "server-only"

import { env } from "@/lib/env"
import { getMedecinAffiliations } from "@/lib/actor-records"
import { getActorAffiliationTypes, getMedecinSpecialties } from "@/lib/actor-references"
import { getClubs, getEquipeNationale, getMedecins } from "@/lib/data"
import { replaceActiveAffiliation } from "@/lib/affiliation-write"
import { assertDateOrder, assertValidDate } from "@/lib/date-validation"

const text = (value: unknown) => String(value ?? "").trim()
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "_").toUpperCase()
const statuses = new Set(["actif", "inactif", "active", "inactive", "en attente"])

function nextId(existingIds: string[], saison: string) {
  const year = saison.match(/\b(20\d{2})\b/)?.[1]
  if (!year) throw new Error("La saison doit contenir une année, par exemple 2026 ou 2026-2027.")
  const pattern = new RegExp(`^MED\\.AFF-(\\d+)\\/${year}$`, "i")
  const max = existingIds.reduce((highest, id) => {
    const match = id.match(pattern)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 0)
  return `MED.AFF-${String(max + 1).padStart(4, "0")}/${year}`
}

export async function createMedecinAffiliation(idMedecin: string, payload: Record<string, unknown>) {
  const saison = text(payload.saison)
  const typeAffiliation = text(payload.typeAffiliation)
  const structureKey = text(payload.structureKey)
  const fonction = text(payload.fonction)
  const dateDebut = text(payload.dateDebut)
  const dateFin = text(payload.dateFin)
  const statutAffiliation = text(payload.statutAffiliation).toLowerCase() || "actif"
  const observation = text(payload.observation)

  if (!saison) throw new Error("La saison est obligatoire.")
  if (!typeAffiliation) throw new Error("Le type d’affiliation est obligatoire.")
  if (!structureKey) throw new Error("La structure est obligatoire.")
  if (!fonction) throw new Error("La fonction est obligatoire.")
  assertValidDate(dateDebut, "La date de début", true)
  assertValidDate(dateFin, "La date de fin")
  assertDateOrder(dateDebut, dateFin, "La date de fin doit être postérieure à la date de début.")
  if (!statuses.has(statutAffiliation)) throw new Error("Le statut est invalide.")

  const [medecins, clubs, equipes, affiliations, types, specialties] = await Promise.all([
    getMedecins(), getClubs(), getEquipeNationale(), getMedecinAffiliations(), getActorAffiliationTypes(), getMedecinSpecialties(),
  ])
  const medecin = medecins.find((item) => item.idMedecin === idMedecin)
  if (!medecin) throw new Error("Médecin introuvable.")
  const structures = [
    ...clubs.map((item) => ({ key: `club:${item.idClub}`, id: item.idClub, nom: item.nomClub, type: "CLUB" })),
    ...equipes.map((item) => ({ key: `equipe:${item.idEquipeNationale}`, id: item.idEquipeNationale, nom: item.nomEquipeNationale, type: "EQUIPE_NATIONALE" })),
  ]
  const structure = structures.find((item) => item.key === structureKey)
  if (!structure) throw new Error("Structure introuvable.")
  const normalizedType = normalize(typeAffiliation)
  if (!["CLUB", "EQUIPE_NATIONALE"].includes(normalizedType)) throw new Error("Le type d’affiliation doit être CLUB ou EQUIPE NATIONALE.")
  if (structure.type !== normalizedType) throw new Error("La structure ne correspond pas au type sélectionné.")
  if (types.length && !types.some((item) => item.nom === typeAffiliation)) throw new Error("Le type d’affiliation sélectionné est invalide.")
  if (specialties.length && !specialties.some((item) => item.nom === fonction)) throw new Error("La spécialité sélectionnée est invalide.")

  const idAffiliation = nextId(affiliations.map((item) => item.idAffiliation), saison)
  const previousAffiliation = affiliations
    .filter((item) => item.actorId === medecin.idMedecin && normalize(item.typeAffiliation) === normalizedType)
    .at(-1)
  await replaceActiveAffiliation({
    spreadsheetId: env.googleSheets.affiliationsSpreadsheetId,
    sheetName: "MEDECIN_AFFILIATIONS",
    previous: previousAffiliation ? {
      id: previousAffiliation.idAffiliation,
      status: previousAffiliation.statutAffiliation,
      endDate: previousAffiliation.dateFin,
      replacementEndDate: normalizedType === "CLUB" ? dateDebut : undefined,
    } : undefined,
    record: {
      id_affiliation: idAffiliation, saison, id_medecin: medecin.idMedecin,
      nom_medecin: medecin.nomComplet, type_affiliation: typeAffiliation,
      id_structure: structure.id, nom_structure: structure.nom, fonction,
      date_debut: dateDebut, date_fin: dateFin,
      statut_affiliation: statutAffiliation, observation,
    },
  })
  const saved = (await getMedecinAffiliations()).find((item) => item.idAffiliation === idAffiliation)
  return {
    deactivatedAffiliationId: previousAffiliation?.idAffiliation ?? "",
    affiliation: saved ?? {
      idAffiliation, saison, actorId: medecin.idMedecin, actorName: medecin.nomComplet,
      typeAffiliation, idStructure: structure.id, nomStructure: structure.nom,
      fonction, dateDebut, dateFin, statutAffiliation, observation,
    },
  }
}
