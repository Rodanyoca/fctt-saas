"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Transfert } from "@/lib/types"
import { Search } from "lucide-react"

export function TransfertsFilters({
  transferts,
  search,
  statut,
  saison,
  onSearchChange,
  onStatutChange,
  onSaisonChange,
}: {
  transferts: Transfert[]
  search: string
  statut: string
  saison: string
  onSearchChange: (value: string) => void
  onStatutChange: (value: string) => void
  onSaisonChange: (value: string) => void
}) {
  const statuts = Array.from(new Set(transferts.map((transfert) => transfert.statut).filter(Boolean))).sort()
  const saisons = Array.from(new Set(transferts.map((transfert) => transfert.saison).filter(Boolean))).sort()

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un transfert..."
              className="pl-9"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <Select value={saison} onValueChange={onSaisonChange}>
            <SelectTrigger className="w-full lg:w-[190px]">
              <SelectValue placeholder="Saison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les saisons</SelectItem>
              {saisons.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statut} onValueChange={onStatutChange}>
            <SelectTrigger className="w-full lg:w-[190px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {statuts.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
    </div>
  )
}
