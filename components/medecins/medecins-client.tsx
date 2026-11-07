"use client"

import { useEffect, useMemo, useState } from "react"
import type { BaseActorLicence, Medecin, MedecinAffiliation } from "@/lib/types"
import { MedecinsFilters } from "@/components/medecins/medecins-filters"
import { MedecinsTable } from "@/components/medecins/medecins-table"
import { MedecinDetail } from "@/components/medecins/medecin-detail"
import { MedecinFormDialog } from "@/components/medecins/medecin-form-dialog"
import type { SavedMedecin } from "@/components/medecins/medecin-form-dialog"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"
import { compareLabels } from "@/lib/sort-utils"
import type { MedecinStructureOption } from "@/components/medecins/medecin-affiliation-form-dialog"

const affiliationKind = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "_").toUpperCase()

export function MedecinsClient({ medecins, affiliations, licences, sexes, structures, affiliationTypes, specialties }: {
  medecins: Medecin[]
  affiliations: MedecinAffiliation[]
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
  structures: MedecinStructureOption[]
  affiliationTypes: CoachReferenceOption[]
  specialties: CoachReferenceOption[]
}) {
  const [rows, setRows] = useState(medecins)
  const [affiliationRows, setAffiliationRows] = useState(affiliations)
  const [licenceRows, setLicenceRows] = useState(licences)
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null)
  const [search, setSearch] = useState("")
  const [sexe, setSexe] = useState("all")
  const [specialite, setSpecialite] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => setRows(medecins), [medecins])
  useEffect(() => setAffiliationRows(affiliations), [affiliations])
  useEffect(() => setLicenceRows(licences), [licences])

  const applySavedMedecin = (saved: SavedMedecin) => {
    setRows((current) => {
      const existing = current.find((medecin) => medecin.idMedecin === saved.idMedecin)
      const merged: Medecin = {
        avatarDriveId: "", avatarDriveUrl: "", passeportDriveId: "", passeportDriveUrl: "", niveau: "", numeroOrdre: "", equipeNationale: "",
        provinceId: "", provinceNom: "", ligueId: "", ligueNom: "", ententeId: "", ententeNom: "",
        pseudoEntente: "", clubId: "", clubNom: "", equipeId: "", equipeNom: "",
        dateAffiliation: "", affiliations: [],
        ...existing, ...saved, id: saved.idMedecin, dateNaissance: saved.dateDeNaissance, genre: saved.sexe,
      }
      return existing
        ? current.map((medecin) => medecin.idMedecin === saved.idMedecin ? merged : medecin)
        : [merged, ...current]
    })
    setSelectedMedecin((current) => current?.idMedecin === saved.idMedecin
      ? { ...current, ...saved, id: saved.idMedecin, dateNaissance: saved.dateDeNaissance, genre: saved.sexe }
      : current)
  }

  const applyCreatedAffiliation = (affiliation: MedecinAffiliation, deactivatedId: string) => {
    const closesPreviousClub = affiliationKind(affiliation.typeAffiliation) === "CLUB"
    setAffiliationRows((current) => [
      affiliation,
      ...current.map((item) => item.idAffiliation === deactivatedId
        ? {
            ...item,
            statutAffiliation: "inactif",
            ...(closesPreviousClub ? { dateFin: affiliation.dateDebut } : {}),
          }
        : item),
    ])
  }

  const filteredMedecins = useMemo(() => {
    const term = search.trim().toLowerCase()

    return rows.filter((medecin) => {
      if (sexe !== "all" && medecin.sexe !== sexe) return false
      if (specialite !== "all" && medecin.specialite !== specialite) return false
      if (statut !== "all" && medecin.statut !== statut) return false

      if (term) {
        const haystack = `${medecin.nomComplet} ${medecin.idMedecin} ${medecin.specialite}`.toLowerCase()

        if (!haystack.includes(term)) return false
      }

      return true
    }).sort((left, right) => compareLabels(left.nomComplet, right.nomComplet))
  }, [rows, search, sexe, specialite, statut])

  return (
    <div className="space-y-6">
      {selectedMedecin ? (
        <MedecinDetail medecin={selectedMedecin} affiliations={affiliationRows} licences={licenceRows} sexes={sexes} specialties={specialties} structures={structures} affiliationTypes={affiliationTypes} onAffiliationCreated={applyCreatedAffiliation} onLicenceCreated={(licence, deactivatedId) => setLicenceRows((current) => [licence, ...current.map((item) => item.idLicence === deactivatedId ? { ...item, statutLicence: "INACTIF" } : item)])} onUpdated={applySavedMedecin} onBack={() => setSelectedMedecin(null)} />
      ) : (
        <>
          <div className="flex justify-end"><MedecinFormDialog sexes={sexes} specialties={specialties} onSaved={applySavedMedecin} /></div>
          <MedecinsFilters
            medecins={rows}
            search={search}
            sexe={sexe}
            specialite={specialite}
            statut={statut}
            onSearchChange={setSearch}
            onSexeChange={setSexe}
            onSpecialiteChange={setSpecialite}
            onStatutChange={setStatut}
          />
          <MedecinsTable medecins={filteredMedecins} onViewMedecin={setSelectedMedecin} />
        </>
      )}
    </div>
  )
}
