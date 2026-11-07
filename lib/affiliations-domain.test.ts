import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's transform-types runner requires an explicit TypeScript extension.
import { createAffiliationDomain, type AffiliationRow, type AffiliationStore } from "./affiliations-domain.ts"

function memoryStore(seed: AffiliationRow[] = []): AffiliationStore & { rows: AffiliationRow[] } {
  const rows = structuredClone(seed)
  return {
    rows,
    async list() { return structuredClone(rows) },
    async save(row) { const index = rows.findIndex((item) => item.id === row.id); if (index < 0) rows.push(structuredClone(row)); else rows[index] = structuredClone(row) },
    async actorExists(kind, id) { return id === `${kind}-1` },
    async clubExists(id) { return id === "club-1" },
    async entityExists(typeId, id) { return typeId === "STR001" && id === "ligue-1" },
    async statusExists(id) { return ["SAF001", "SAF002"].includes(id) },
    async officialFunctionExists(id) { return id === "FON001" },
  }
}

test("crée une affiliation d’athlète à un club", async () => {
  const store = memoryStore(), domain = createAffiliationDomain(store)
  const result = await domain.create("athlete", "athlete-1", { id_club: "club-1", date_debut: "01/09/2026", date_fin: "", id_statut_affiliation: "SAF001", observations: "" })
  assert.equal(result.row.id, "AFA-000001")
  assert.equal(result.row.dateDebut, "2026-09-01")
  assert.equal(store.rows.length, 1)
})

test("une commande identique est idempotente", async () => {
  const store = memoryStore(), domain = createAffiliationDomain(store)
  const command = { id_club: "club-1", date_debut: "01/09/2026", date_fin: "", id_statut_affiliation: "SAF001", observations: "" }
  await domain.create("athlete", "athlete-1", command)
  const second = await domain.create("athlete", "athlete-1", command)
  assert.equal(second.created, false)
  assert.equal(store.rows.length, 1)
})

test("refuse les périodes inclusivement chevauchantes", async () => {
  const store = memoryStore([{ id: "AFA-000001", kind: "athlete", actorId: "athlete-1", clubId: "club-1", entityTypeId: "", entityId: "", functionId: "", dateDebut: "2026-09-01", dateFin: "2026-09-30", statusId: "SAF001", observations: "" }])
  const domain = createAffiliationDomain(store)
  await assert.rejects(() => domain.create("athlete", "athlete-1", { id_club: "club-1", date_debut: "30/09/2026", date_fin: "31/10/2026", id_statut_affiliation: "SAF001", observations: "autre" }), (error: unknown) => error instanceof Error && "code" in error && error.code === "CHEVAUCHEMENT")
})

test("refuse une affiliation d’arbitre", async () => {
  const domain = createAffiliationDomain(memoryStore())
  await assert.rejects(() => domain.create("arbitre" as never, "arbitre-1", {}), /pas pris en charge/i)
})
