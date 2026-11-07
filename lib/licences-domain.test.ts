import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's transform-types runner requires an explicit TypeScript extension.
import { createLicenceDomain, effectiveLicenceStatus, type LicenceStore } from "./licences-domain.ts"

function store(): LicenceStore & { athleteLicences: Record<string, string>[]; actorLicences: Record<string, string>[] } {
  const athleteLicences: Record<string, string>[] = [], actorLicences: Record<string, string>[] = []
  return {
    athleteLicences, actorLicences,
    async load() { return { athleteLicences, actorLicences } },
    async appendAthlete(rows) { athleteLicences.push(...rows) }, async appendActor(row) { actorLicences.push(row) },
    async athleteExists(id) { return id === "ATH001" }, async actorExists(type, id) { return ({ TAC002: "COA001", TAC003: "OFF001", TAC004: "ARB001", TAC005: "MED001" }[type] === id) },
    async seasonExists(id) { return id === "SAI001" }, async cycleExists(id) { return ["CYC001", "CYC002"].includes(id) }, async statusExists(id) { return id === "STL001" },
    async affiliation(kind, id) { if (id !== `AFF-${kind}`) return null; return { id, actorId: kind === "athlete" ? "ATH001" : ({ coach: "COA001", officiel: "OFF001", medecin: "MED001" } as Record<string, string>)[kind], activeFrom: "2026-01-01", activeUntil: "", statusId: "SAF001", targetExists: true } },
  }
}

test("crée une licence saisonnière depuis une affiliation active", async () => {
  const memory = store(), domain = createLicenceDomain(memory)
  const row = await domain.createAthlete({ id_athlete: "ATH001", id_saison: "SAI001", id_affiliation_athlete: "AFF-athlete", numero_licence: "123", date_delivrance: "01/09/2026", id_statut_licence: "STL001", observations: "" }, "2026-09-01")
  assert.equal(row.id_licence, "VOL-LIC-2026-000001")
})

test("autorise une licence depuis une affiliation existante même terminée", async () => {
  const memory = store(), domain = createLicenceDomain(memory)
  memory.affiliation = async (_kind, id) => id === "AFF-HISTORIQUE" ? { id, actorId: "ATH001", activeFrom: "2024-01-01", activeUntil: "2024-12-31", statusId: "SAF002", targetExists: false } : null
  const row = await domain.createAthlete({ id_athlete: "ATH001", id_saison: "SAI001", id_affiliation_athlete: "AFF-HISTORIQUE", numero_licence: "124", date_delivrance: "01/09/2026", id_statut_licence: "STL001", observations: "" }, "2026-09-01")
  assert.equal(row.id_affiliation_athlete, "AFF-HISTORIQUE")
})

test("refuse une affiliation appartenant à un autre athlète", async () => {
  const memory = store(), domain = createLicenceDomain(memory)
  memory.affiliation = async (_kind, id) => ({ id, actorId: "ATH999", activeFrom: "2026-01-01", activeUntil: "", statusId: "SAF001", targetExists: true })
  await assert.rejects(() => domain.createAthlete({ id_athlete: "ATH001", id_saison: "SAI001", id_affiliation_athlete: "AFF-AUTRE", numero_licence: "125", date_delivrance: "01/09/2026", id_statut_licence: "STL001", observations: "" }, "2026-09-01"), (error: unknown) => error instanceof Error && "code" in error && error.code === "AFFILIATION_INADMISSIBLE")
})

test("refuse une deuxième licence pour le même athlète et la même saison", async () => {
  const memory = store(), domain = createLicenceDomain(memory), command = { id_athlete: "ATH001", id_saison: "SAI001", id_affiliation_athlete: "AFF-athlete", numero_licence: "123", date_delivrance: "01/09/2026", id_statut_licence: "STL001", observations: "" }
  await domain.createAthlete(command, "2026-09-01")
  await assert.rejects(() => domain.createAthlete(command, "2026-09-01"), (error: unknown) => error instanceof Error && "code" in error && error.code === "LICENCE_EXISTANTE")
})

test("autorise l’arbitre sans affiliation et refuse une fausse affiliation", async () => {
  const memory = store(), domain = createLicenceDomain(memory), base = { id_type_acteur: "TAC004", id_acteur: "ARB001", id_cycle_licence: "CYC001", numero_licence: "ARB-9", date_delivrance: "01/01/2026", date_debut_validite: "01/01/2026", date_fin_validite: "31/12/2026", id_statut_licence: "STL001", observations: "" }
  const row = await domain.createActor({ ...base, id_affiliation_acteur: "" })
  assert.equal(row.id_affiliation_acteur, "")
  await assert.rejects(() => domain.createActor({ ...base, numero_licence: "ARB-10", id_affiliation_acteur: "AFF-arbitre" }), /ne doit pas avoir d’affiliation/i)
})

test("calcule les statuts temporels et conserve la priorité manuelle", () => {
  assert.equal(effectiveLicenceStatus("ACTIVE", "2026-10-01", "2027-09-30", "2026-09-01"), "A_VENIR")
  assert.equal(effectiveLicenceStatus("ACTIVE", "2026-01-01", "2026-12-31", "2026-09-01"), "VALIDE")
  assert.equal(effectiveLicenceStatus("ACTIVE", "2025-01-01", "2025-12-31", "2026-09-01"), "EXPIREE")
  assert.equal(effectiveLicenceStatus("SUSPENDUE", "2026-01-01", "2026-12-31", "2026-09-01"), "SUSPENDUE")
})
