"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Athlete } from "@/lib/types"
import { Search } from "lucide-react"

export function AthletesFilters({
  athletes,
  search,
  club,
  genre,
  statut,
  onSearchChange,
  onClubChange,
  onGenreChange,
  onStatutChange,
}: {
  athletes: Athlete[]
  search: string
  club: string
  genre: string
  statut: string
  onSearchChange: (value: string) => void
  onClubChange: (value: string) => void
  onGenreChange: (value: string) => void
  onStatutChange: (value: string) => void
}) {
  const clubsOptions = Array.from(new Set(athletes.map((athlete) => athlete.clubNom).filter(Boolean)))

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
        <div className="contents">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un athlète..."
              className="pl-9"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          {clubsOptions.length > 0 && <Select value={club} onValueChange={onClubChange}>
            <SelectTrigger className="w-full lg:w-[220px]">
              <SelectValue placeholder="Club" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les clubs</SelectItem>
              {clubsOptions.map((clubNom) => (
                <SelectItem key={clubNom} value={clubNom}>
                  {clubNom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>}

          <Select value={genre} onValueChange={onGenreChange}>
            <SelectTrigger className="w-full lg:w-[150px]">
              <SelectValue placeholder="Sexe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="M">Masculin</SelectItem>
              <SelectItem value="F">Féminin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statut} onValueChange={onStatutChange}>
            <SelectTrigger className="w-full lg:w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
              <SelectItem value="blesse">Blessé</SelectItem>
            </SelectContent>
          </Select>
        </div>
    </div>
  )
}
