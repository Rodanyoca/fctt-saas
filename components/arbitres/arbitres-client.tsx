"use client"

import { useEffect, useMemo, useState } from "react"
import type { Arbitre, BaseActorLicence } from "@/lib/types"
import { ArbitresFilters } from "@/components/arbitres/arbitres-filters"
import { ArbitresTable } from "@/components/arbitres/arbitres-table"
import { ArbitreDetail } from "@/components/arbitres/arbitre-detail"
import { ArbitreFormDialog } from "@/components/arbitres/arbitre-form-dialog"
import type { SavedArbitre } from "@/components/arbitres/arbitre-form-dialog"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"
import { compareLabels } from "@/lib/sort-utils"

export function ArbitresClient({ arbitres, licences, sexes, grades }: {
  arbitres: Arbitre[]
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
  grades: CoachReferenceOption[]
}) {
  const [rows, setRows] = useState(arbitres)
  const [licenceRows, setLicenceRows] = useState(licences)
  const [selectedArbitre, setSelectedArbitre] = useState<Arbitre | null>(null)
  const [search, setSearch] = useState("")
  const [equipeNationale, setEquipeNationale] = useState("all")
  const [grade, setGrade] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => setRows(arbitres), [arbitres])
  useEffect(() => setLicenceRows(licences), [licences])

  const applySavedArbitre = (saved: SavedArbitre) => {
    setRows((current) => {
      const existing = current.find((arbitre) => arbitre.idArbitre === saved.idArbitre)
      const merged: Arbitre = {
        avatarDriveId: "", avatarDriveUrl: "", provinceId: "", provinceNom: "",
        ligueId: "", ligueNom: "", ententeId: "", ententeNom: "",
        dateHomologation: "", equipeNational: "", experience: "",
        ...existing, ...saved, id: saved.idArbitre, dateNaissance: saved.dateDeNaissance,
        genre: saved.sexe, grade: saved.grade, dateAffiliation: existing?.dateAffiliation ?? "",
      }
      return existing
        ? current.map((arbitre) => arbitre.idArbitre === saved.idArbitre ? merged : arbitre)
        : [merged, ...current]
    })
    setSelectedArbitre((current) => current?.idArbitre === saved.idArbitre
      ? { ...current, ...saved, id: saved.idArbitre, dateNaissance: saved.dateDeNaissance, genre: saved.sexe, grade: saved.grade }
      : current)
  }

  const filteredArbitres = useMemo(() => {
    const term = search.trim().toLowerCase()

    return rows.filter((arbitre) => {
      if (equipeNationale !== "all" && arbitre.equipeNational !== equipeNationale) return false
      if (grade !== "all" && arbitre.grade !== grade) return false
      if (statut !== "all" && arbitre.statut !== statut) return false

      if (term) {
        const licenceNumbers = licenceRows
          .filter((licence) => licence.actorId === arbitre.idArbitre)
          .map((licence) => licence.numeroLicence)
          .join(" ")
        const haystack = `${arbitre.nomComplet} ${licenceNumbers}`.toLowerCase()

        if (!haystack.includes(term)) return false
      }

      return true
    }).sort((left, right) => compareLabels(left.nomComplet, right.nomComplet))
  }, [rows, licenceRows, equipeNationale, grade, search, statut])

  return (
    <div className="space-y-6">
      {selectedArbitre ? (
        <ArbitreDetail arbitre={selectedArbitre} licences={licenceRows} sexes={sexes} grades={grades} onLicenceCreated={(licence, deactivatedId) => setLicenceRows((current) => [licence, ...current.map((item) => item.idLicence === deactivatedId ? { ...item, statutLicence: "INACTIF" } : item)])} onUpdated={applySavedArbitre} onBack={() => setSelectedArbitre(null)} />
      ) : (
        <>
          <div className="flex justify-end"><ArbitreFormDialog sexes={sexes} grades={grades} onSaved={applySavedArbitre} /></div>
          <ArbitresFilters
            arbitres={rows}
            search={search}
            equipeNationale={equipeNationale}
            grade={grade}
            statut={statut}
            onSearchChange={setSearch}
            onEquipeNationaleChange={setEquipeNationale}
            onGradeChange={setGrade}
            onStatutChange={setStatut}
          />
          <ArbitresTable arbitres={filteredArbitres} onViewArbitre={setSelectedArbitre} />
        </>
      )}
    </div>
  )
}
