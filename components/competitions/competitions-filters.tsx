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
import type { Competition } from "@/lib/types"

export function CompetitionsFilters({
  search,
  discipline,
  statut,
  statuts,
  competitions,
  saison, type, format, niveau,
  onSearchChange,
  onDisciplineChange,
  onStatutChange,
  onSaisonChange, onTypeChange, onFormatChange, onNiveauChange,
}: {
  search: string
  discipline: string
  statut: string
  statuts: string[]
  competitions: Competition[]
  saison: string
  type: string
  format: string
  niveau: string
  onSearchChange: (value: string) => void
  onDisciplineChange: (value: string) => void
  onStatutChange: (value: string) => void
  onSaisonChange: (value: string) => void
  onTypeChange: (value: string) => void
  onFormatChange: (value: string) => void
  onNiveauChange: (value: string) => void
}) {
  const values = (field: keyof Competition) =>
    Array.from(new Set(competitions.map((item) => String(item[field] || "")).filter(Boolean))).sort()
  return (
    <div className="flex flex-col gap-4">
      <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une competition..."
            className="w-full pl-9"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <Select value={discipline} onValueChange={onDisciplineChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Discipline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="INDOOR">Indoor</SelectItem>
            <SelectItem value="BEACH">Beach</SelectItem>
          </SelectContent>
        </Select>

        {[
          ["Saison", saison, onSaisonChange, values("saison")],
          ["Type", type, onTypeChange, values("typeCompetition")],
          ["Format", format, onFormatChange, values("formatCompetition")],
          ["Niveau", niveau, onNiveauChange, values("niveau")],
        ].map(([label, selected, change, options]) => (
          <Select key={String(label)} value={selected as string} onValueChange={change as (value: string) => void}>
            <SelectTrigger className="w-full"><SelectValue placeholder={String(label)} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {(options as string[]).map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
            </SelectContent>
          </Select>
        ))}

        <Select value={statut} onValueChange={onStatutChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {statuts.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
