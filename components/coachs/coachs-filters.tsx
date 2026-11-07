"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import type { Coach } from "@/lib/types"

interface CoachsFiltersProps {
  coachs: Coach[]
  search: string
  niveau: string
  statut: string
  onSearchChange: (value: string) => void
  onNiveauChange: (value: string) => void
  onStatutChange: (value: string) => void
}

export function CoachsFilters({
  coachs,
  search,
  niveau,
  statut,
  onSearchChange,
  onNiveauChange,
  onStatutChange,
}: CoachsFiltersProps) {
  const niveauOptions = Array.from(
    new Set(coachs.map((coach) => coach.niveau).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Rechercher par nom ou numéro de licence..."
              className="pl-9"
            />
          </div>

          <Select value={niveau} onValueChange={onNiveauChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              {niveauOptions.map((niveauNom) => (
                <SelectItem key={niveauNom} value={niveauNom}>
                  {niveauNom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statut} onValueChange={onStatutChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
    </div>
  )
}
