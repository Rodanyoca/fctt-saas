import test from "node:test"
import assert from "node:assert/strict"
import { nextAutreActeurId, normalizePhone, requiresOtherTypePrecision, selectableAutreActeurTypes, validateAutreActeurType } from "./autres-acteurs-domain.ts"

test("génère AUT##### depuis le plus grand identifiant valide", () => {
  assert.equal(nextAutreActeurId(["AUT00001", "ligne invalide", "AUT00003"]), "AUT00004")
  assert.equal(nextAutreActeurId(["AUT00001", "AUT00003", "AUT00002"]), "AUT00004")
})

test("conserve les zéros à gauche", () => assert.equal(nextAutreActeurId([]), "AUT00001"))

test("normalise le téléphone", () => assert.equal(normalizePhone("+243 999-111-222"), "+243999111222"))

test("propose les types actifs et conserve un type historique inactif", () => {
  const types = [{ id: "TAU001", statut: "ACTIF" }, { id: "TAU002", statut: "INACTIF" }]
  assert.deepEqual(selectableAutreActeurTypes(types).map((item) => item.id), ["TAU001"])
  assert.deepEqual(selectableAutreActeurTypes(types, "TAU002").map((item) => item.id), ["TAU001", "TAU002"])
  assert.throws(() => validateAutreActeurType(types, "TAU002"), /plus actif/)
  assert.equal(validateAutreActeurType(types, "TAU002", "TAU002")?.id, "TAU002")
})

test("exige une précision métier pour TAU099", () => {
  assert.equal(requiresOtherTypePrecision("TAU099", ""), true)
  assert.equal(requiresOtherTypePrecision("TAU099", "Partenaire"), false)
  assert.equal(requiresOtherTypePrecision("TAU001", ""), false)
})
