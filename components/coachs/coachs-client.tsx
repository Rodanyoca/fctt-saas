"use client"

import { useEffect, useMemo, useState } from "react"
import type { BaseActorLicence, Coach, CoachAffiliation } from "@/lib/types"
import { CoachsFilters } from "@/components/coachs/coachs-filters"
import { CoachsTable } from "@/components/coachs/coachs-table"
import { CoachDetail } from "@/components/coachs/coach-detail"
import { CoachFormDialog } from "@/components/coachs/coach-form-dialog"
import type { SavedCoach } from "@/components/coachs/coach-form-dialog"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"
import { compareLabels } from "@/lib/sort-utils"
import type { CoachStructureOption } from "@/components/coachs/coach-affiliation-form-dialog"

const affiliationKind = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "_").toUpperCase()

export function CoachsClient({
  coachs,
  affiliations,
  licences,
  sexes,
  levels,
  structures,
  affiliationTypes,
  coachFunctions,
}: {
  coachs: Coach[]
  affiliations: CoachAffiliation[]
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
  levels: CoachReferenceOption[]
  structures: CoachStructureOption[]
  affiliationTypes: CoachReferenceOption[]
  coachFunctions: CoachReferenceOption[]
}) {
  const [rows, setRows] = useState(coachs)
  const [affiliationRows, setAffiliationRows] = useState(affiliations)
  const [licenceRows, setLicenceRows] = useState(licences)
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)
  const [search, setSearch] = useState("")
  const [niveau, setNiveau] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => setRows(coachs), [coachs])
  useEffect(() => setAffiliationRows(affiliations), [affiliations])
  useEffect(() => setLicenceRows(licences), [licences])

  const applySavedCoach = (saved: SavedCoach) => {
    setRows((current) => {
      const existing = current.find((coach) => coach.idCoach === saved.idCoach)
      const merged: Coach = {
        avatarDriveId: "", avatarDriveUrl: "", lieuNaissance: "", specialisation: "", dateAffiliation: "",
        ...existing, ...saved, id: saved.idCoach, genre: saved.sexe,
      }
      return existing ? current.map((coach) => coach.idCoach === saved.idCoach ? merged : coach) : [merged, ...current]
    })
    setSelectedCoach((current) => current?.idCoach === saved.idCoach
      ? { ...current, ...saved, id: saved.idCoach, genre: saved.sexe }
      : current)
  }

  const applyCreatedAffiliation = (affiliation: CoachAffiliation, deactivatedId: string) => {
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

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return rows.filter((coach) => {
      if (niveau !== "all" && coach.niveau !== niveau) return false
      if (statut !== "all" && coach.statut !== statut) return false

      if (s) {
        const licenceNumbers = licenceRows
          .filter((licence) => licence.actorId === coach.idCoach)
          .map((licence) => licence.numeroLicence)
          .join(" ")
        const haystack = `${coach.nomComplet} ${licenceNumbers}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    }).sort((left, right) => compareLabels(left.nomComplet, right.nomComplet))
  }, [rows, licenceRows, niveau, search, statut])

  return (
    <div className="space-y-6">
      {selectedCoach ? (
        <CoachDetail coach={selectedCoach} affiliations={affiliationRows} licences={licenceRows} sexes={sexes} levels={levels} structures={structures} affiliationTypes={affiliationTypes} coachFunctions={coachFunctions} onAffiliationCreated={applyCreatedAffiliation} onLicenceCreated={(licence, deactivatedId) => setLicenceRows((current) => [licence, ...current.map((item) => item.idLicence === deactivatedId ? { ...item, statutLicence: "INACTIF" } : item)])} onUpdated={applySavedCoach} onBack={() => setSelectedCoach(null)} />
      ) : (
        <>
          <div className="flex justify-end"><CoachFormDialog sexes={sexes} levels={levels} onSaved={applySavedCoach} /></div>
          <CoachsFilters
            coachs={rows}
            search={search}
            niveau={niveau}
            statut={statut}
            onSearchChange={setSearch}
            onNiveauChange={setNiveau}
            onStatutChange={setStatut}
          />
          <CoachsTable coachs={filtered} onViewCoach={setSelectedCoach} />
        </>
      )}
    </div>
  )
}
