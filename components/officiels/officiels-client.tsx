"use client"

import { useEffect, useMemo, useState } from "react"
import type { BaseActorLicence, Officiel, OfficielAffiliation } from "@/lib/types"
import { OfficielsFilters } from "@/components/officiels/officiels-filters"
import { OfficielsTable } from "@/components/officiels/officiels-table"
import { OfficielDetail } from "@/components/officiels/officiel-detail"
import { OfficielFormDialog } from "@/components/officiels/officiel-form-dialog"
import type { SavedOfficiel } from "@/components/officiels/officiel-form-dialog"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"
import { compareLabels } from "@/lib/sort-utils"
import type { OfficielStructureOption } from "@/components/officiels/officiel-affiliation-form-dialog"

export function OfficielsClient({ officiels, affiliations, licences, sexes, structures, functions, structureTypes, seasons }: {
  officiels: Officiel[]
  affiliations: OfficielAffiliation[]
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
  structures: OfficielStructureOption[]
  functions: CoachReferenceOption[]
  structureTypes: CoachReferenceOption[]
  seasons: CoachReferenceOption[]
}) {
  const [rows, setRows] = useState(officiels)
  const [affiliationRows, setAffiliationRows] = useState(affiliations)
  const [licenceRows, setLicenceRows] = useState(licences)
  const [selectedOfficiel, setSelectedOfficiel] = useState<Officiel | null>(null)
  const [search, setSearch] = useState("")
  const [sexe, setSexe] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => setRows(officiels), [officiels])
  useEffect(() => setAffiliationRows(affiliations), [affiliations])
  useEffect(() => setLicenceRows(licences), [licences])

  const applySavedOfficiel = (saved: SavedOfficiel) => {
    setRows((current) => {
      const existing = current.find((officiel) => officiel.idOfficiel === saved.idOfficiel)
      const merged: Officiel = {
        ...existing, ...saved,
        avatarDriveId: "", avatarDriveUrl: "", fonction: "", entite: "", rattachement: "",
        dateNomination: "", dateFinMandat: "", equipeFederal: "", passeportDriveId: "", passeportDriveUrl: "",
        ...existing, ...saved, id: saved.idOfficiel, dateNaissance: saved.dateDeNaissance, genre: saved.sexe,
      }
      return existing
        ? current.map((officiel) => officiel.idOfficiel === saved.idOfficiel ? merged : officiel)
        : [merged, ...current]
    })
    setSelectedOfficiel((current) => current?.idOfficiel === saved.idOfficiel
      ? { ...current, ...saved, id: saved.idOfficiel, dateNaissance: saved.dateDeNaissance, genre: saved.sexe }
      : current)
  }

  const applyCreatedAffiliation = (affiliation: OfficielAffiliation, deactivatedId: string) => {
    setAffiliationRows((current) => [
      affiliation,
      ...current.map((item) => item.idAffiliation === deactivatedId
        ? { ...item, statutAffiliation: "inactif", dateFin: affiliation.dateDebut }
        : item),
    ])
  }

  const filteredOfficiels = useMemo(() => {
    const term = search.trim().toLowerCase()

    return rows.filter((officiel) => {
      if (sexe !== "all" && officiel.sexe !== sexe) return false
      if (statut !== "all" && officiel.statut !== statut) return false

      if (term) {
        const licenceNumbers = licenceRows
          .filter((licence) => licence.actorId === officiel.idOfficiel)
          .map((licence) => licence.numeroLicence)
          .join(" ")
        const mandat = affiliationRows.find((item) => item.actorId === officiel.idOfficiel)
        const haystack = `${officiel.nomComplet} ${officiel.idOfficiel} ${officiel.idNational} ${licenceNumbers} ${mandat?.fonction ?? ""} ${mandat?.nomStructure ?? ""}`.toLowerCase()

        if (!haystack.includes(term)) return false
      }

      return true
    }).sort((left, right) => compareLabels(left.nomComplet, right.nomComplet))
  }, [affiliationRows, licenceRows, rows, search, sexe, statut])

  return (
    <div className="space-y-6">
      {selectedOfficiel ? (
        <OfficielDetail officiel={selectedOfficiel} affiliations={affiliationRows} licences={licenceRows} sexes={sexes} structures={structures} functions={functions} structureTypes={structureTypes} seasons={seasons} onAffiliationCreated={applyCreatedAffiliation} onLicenceCreated={(licence, deactivatedId) => setLicenceRows((current) => [licence, ...current.map((item) => item.idLicence === deactivatedId ? { ...item, statutLicence: "INACTIF" } : item)])} onUpdated={applySavedOfficiel} onBack={() => setSelectedOfficiel(null)} />
      ) : (
        <>
          <div className="flex justify-end"><OfficielFormDialog sexes={sexes} onSaved={applySavedOfficiel} /></div>
          <OfficielsFilters
            officiels={rows}
            search={search}
            sexe={sexe}
            statut={statut}
            onSearchChange={setSearch}
            onSexeChange={setSexe}
            onStatutChange={setStatut}
          />
          <OfficielsTable officiels={filteredOfficiels} licences={licenceRows} onViewOfficiel={setSelectedOfficiel} />
        </>
      )}
    </div>
  )
}
