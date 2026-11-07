import test from "node:test"
import assert from "node:assert/strict"
import { mapAutreActeurRow, mapTypeAutreActeurRow } from "./autres-acteurs.ts"

test("mappe AUTRES par noms d’en-têtes et résout ses relations", () => {
  const acteur = mapAutreActeurRow({ telephone: "+243", id_type_autre_acteur: "TAU001", nom_complet: "Contact", id_autre_acteur: "AUT00001", id_sexe: "SEX001", colonne_inconnue: "préservée" }, new Map([["SEX001", "MASCULIN"]]), new Map([["TAU001", "PERSONNE DE CONTACT"]]))
  assert.equal(acteur.idAutreActeur, "AUT00001")
  assert.equal(acteur.typeAutreActeur, "PERSONNE DE CONTACT")
  assert.equal(acteur.sexe, "MASCULIN")
  assert.equal(acteur.telephone, "+243")
})

test("conserve la clé inconnue avec un libellé de repli", () => {
  const acteur = mapAutreActeurRow({ id_autre_acteur: "AUT00002", id_type_autre_acteur: "TAU777" }, new Map(), new Map())
  assert.equal(acteur.idTypeAutreActeur, "TAU777")
  assert.equal(acteur.typeAutreActeur, "Type non reconnu")
})

test("mappe le référentiel TYPES_AUTRES_ACTEURS", () => {
  assert.deepEqual(mapTypeAutreActeurRow({ id_type_autre_acteur: "TAU001", nom_type_autre_acteur: "PERSONNE DE CONTACT", observations: "Contact", statut: "ACTIF" }), { id: "TAU001", nom: "Personne de contact", observations: "Contact", statut: "ACTIF" })
})
