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
import type { Arbitre } from "@/lib/types"

interface ArbitresFiltersProps {
  arbitres: Arbitre[]
  search: string
  equipeNationale: string
  grade: string
  statut: string
  onSearchChange: (value: string) => void
  onEquipeNationaleChange: (value: string) => void
  onGradeChange: (value: string) => void
  onStatutChange: (value: string) => void
}

export function ArbitresFilters({
  arbitres,
  search,
  equipeNationale,
  grade,
  statut,
  onSearchChange,
  onEquipeNationaleChange,
  onGradeChange,
  onStatutChange,
}: ArbitresFiltersProps) {
  const equipeOptions = Array.from(
    new Set(arbitres.map((arbitre) => arbitre.equipeNational).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  const gradeOptions = Array.from(
    new Set(arbitres.map((arbitre) => arbitre.grade).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
        <div className="grid gap-3 md:grid-cols-[1fr_190px_160px_132px]">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Rechercher par nom ou numéro de licence..."
              className="pl-9"
            />
          </div>

          {equipeOptions.length > 0 && <Select value={equipeNationale} onValueChange={onEquipeNationaleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les equipes</SelectItem>
              {equipeOptions.map((equipeNom) => (
                <SelectItem key={equipeNom} value={equipeNom}>
                  {equipeNom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>}

          <Select value={grade} onValueChange={onGradeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les grades</SelectItem>
              {gradeOptions.map((gradeNom) => (
                <SelectItem key={gradeNom} value={gradeNom}>
                  {gradeNom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statut} onValueChange={onStatutChange}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
              <SelectItem value="suspendu">Suspendu</SelectItem>
            </SelectContent>
          </Select>
        </div>
    </div>
  )
}
