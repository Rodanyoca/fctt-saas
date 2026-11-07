import assert from "node:assert/strict"
import test from "node:test"
import { mapMedecinRow } from "./medecins.ts"

test("mappe les en-têtes réels et les libellés des référentiels", () => {
  const medecin = mapMedecinRow({
    id_medecin: "MED00001", nom_complet: "Docteur Exemple", id_sexe: "SEX001", nom_sexe: "MASCULIN",
    date_naissance: "1990-09-27", id_specialite: "SPM008", nom_specialite: "URGENTISTE",
    "numéro_passeport": "P123", date_de_delivrance_passeport: "2025-01-01", "date_expiration passeport": "2030-01-01",
  })
  assert.equal(medecin.nomComplet, "Docteur Exemple")
  assert.equal(medecin.sexe, "MASCULIN")
  assert.equal(medecin.specialite, "URGENTISTE")
  assert.equal(medecin.dateDeNaissance, "1990-09-27")
  assert.equal(medecin.numeroPasseport, "P123")
  assert.equal(medecin.dateExpirationPasseport, "2030-01-01")
})

test("accepte les anciens alias sans exposer un identifiant de spécialité", () => {
  const medecin = mapMedecinRow({ id_medecin: "MED00002", nom: "Historique", date_de_naissance: "01/01/1980", id_specialite_sante: "ANCIENNE" })
  assert.equal(medecin.nomComplet, "Historique")
  assert.equal(medecin.dateDeNaissance, "01/01/1980")
  assert.equal(medecin.specialite, "Spécialité inconnue")
})
