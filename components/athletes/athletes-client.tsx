"use client"

import { useEffect, useMemo, useState } from "react"
import type { Athlete, AthleteAffiliation, AthleteLicence } from "@/lib/types"
import { AthletesFilters } from "@/components/athletes/athletes-filters"
import { AthletesTable } from "@/components/athletes/athletes-table"
import { AthleteDetail } from "@/components/athletes/athlete-detail"
import { AthleteFormDialog } from "@/components/athletes/athlete-form-dialog"
import type { SavedAthlete } from "@/components/athletes/athlete-form-dialog"
import type { ActorSexOption } from "@/lib/actor-references"
import { compareLabels } from "@/lib/sort-utils"

export function AthletesClient({
  athletes,
  affiliations,
  licences,
  sexes,
}: {
  athletes: Athlete[]
  affiliations: AthleteAffiliation[]
  licences: AthleteLicence[]
  sexes: ActorSexOption[]
}) {
  const [rows, setRows] = useState(athletes)
  const [affiliationRows, setAffiliationRows] = useState(affiliations)
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)
  const [search, setSearch] = useState("")
  const [club, setClub] = useState("all")
  const [genre, setGenre] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => setRows(athletes), [athletes])
  useEffect(() => setAffiliationRows(affiliations), [affiliations])
  useEffect(() => {
    const returnToList = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "/athletes") {
        setSelectedAthlete(null)
      }
    }

    window.addEventListener("feaco:navigate", returnToList)
    return () => window.removeEventListener("feaco:navigate", returnToList)
  }, [])

  const refreshAffiliations = async (athleteId: string) => {
    const response = await fetch(`/api/athletes/${encodeURIComponent(athleteId)}/affiliations`, { cache: "no-store" })
    if (!response.ok) throw new Error("Actualisation des affiliations impossible.")
    const result = await response.json()
    setAffiliationRows((current) => [
      ...current.filter((item) => item.actorId !== athleteId),
      ...result.affiliations,
    ])
  }

  const openAthlete = (athlete: Athlete) => {
    setSelectedAthlete(athlete)
    void refreshAffiliations(athlete.idAthlete).catch(() => undefined)
  }

  const applySavedAthlete = (saved: SavedAthlete) => {
    setRows((current) => {
      const existing = current.find((item) => item.idAthlete === saved.idAthlete)
      const merged: Athlete = {
        numeroOrdre: "", provinceId: "", provinceNom: "", ligueId: "", ligueNom: "",
        ententeId: "", ententeNom: "", clubId: "", clubNom: "", disciplineActive: "",
        posteIndoor: "", posteBeach: "", numero: "", taille: null, poids: null,
        ...existing, ...saved,
        id: saved.idAthlete, dateNaissance: saved.dateDeNaissance,
        genre: saved.sexe,
      }
      return existing
        ? current.map((item) => item.idAthlete === saved.idAthlete ? merged : item)
        : [merged, ...current]
    })
    setSelectedAthlete((current) => current?.idAthlete === saved.idAthlete
      ? { ...current, ...saved, id: saved.idAthlete, dateNaissance: saved.dateDeNaissance, genre: saved.sexe }
      : current)
  }

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return rows.filter((athlete) => {
      if (club !== "all" && athlete.clubNom !== club) return false
      if (genre !== "all" && athlete.genre !== genre) return false
      if (statut !== "all" && athlete.statut !== statut) return false

      if (s) {
        const haystack = `${athlete.idAthlete} ${athlete.nomComplet} ${athlete.idNational} ${athlete.idFivb}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    }).sort((left, right) => compareLabels(left.nomComplet, right.nomComplet))
  }, [rows, club, genre, search, statut])

  return (
    <div className="space-y-6">
      {selectedAthlete ? (
        <AthleteDetail athlete={selectedAthlete} affiliations={affiliationRows} licences={licences} sexes={sexes} onRefreshAffiliations={() => refreshAffiliations(selectedAthlete.idAthlete)} onUpdated={applySavedAthlete} onBack={() => setSelectedAthlete(null)} />
      ) : (
        <>
          <div className="flex justify-end"><AthleteFormDialog sexes={sexes} onSaved={applySavedAthlete} /></div>
          <AthletesFilters
            athletes={rows}
            search={search}
            club={club}
            genre={genre}
            statut={statut}
            onSearchChange={setSearch}
            onClubChange={setClub}
            onGenreChange={setGenre}
            onStatutChange={setStatut}
          />
          <AthletesTable athletes={filtered} onViewAthlete={openAthlete} />
        </>
      )}
    </div>
  )
}
