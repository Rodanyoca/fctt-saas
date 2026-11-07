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
import type { Medecin } from "@/lib/types"

interface MedecinsFiltersProps {
  medecins: Medecin[]
  search: string
  sexe: string
  specialite: string
  statut: string
  onSearchChange: (value: string) => void
  onSexeChange: (value: string) => void
  onSpecialiteChange: (value: string) => void
  onStatutChange: (value: string) => void
}

export function MedecinsFilters({
  medecins,
  search,
  sexe,
  specialite,
  statut,
  onSearchChange,
  onSexeChange,
  onSpecialiteChange,
  onStatutChange,
}: MedecinsFiltersProps) {
  const specialiteOptions = Array.from(
    new Set(medecins.map((medecin) => medecin.specialite).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))
  const sexeOptions = Array.from(
    new Set(medecins.map((medecin) => medecin.sexe).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
        <div className="grid w-full gap-3 md:grid-cols-[minmax(240px,1fr)_150px_180px_132px]">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Rechercher un médecin..."
              className="pl-9"
            />
          </div>

          <Select value={sexe} onValueChange={onSexeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sexe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les sexes</SelectItem>
              {sexeOptions.map((sexeNom) => <SelectItem key={sexeNom} value={sexeNom}>{sexeNom}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={specialite} onValueChange={onSpecialiteChange}>
            <SelectTrigger>
              <SelectValue placeholder="Spécialité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les spécialités</SelectItem>
              {specialiteOptions.map((specialiteNom) => (
                <SelectItem key={specialiteNom} value={specialiteNom}>
                  {specialiteNom}
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
            </SelectContent>
          </Select>
        </div>
    </div>
  )
}
