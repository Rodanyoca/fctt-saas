"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { Transfert } from "@/lib/types"
import { ArrowLeft, ArrowRight, ArrowRightLeft, CalendarDays, FileText, User } from "lucide-react"
import { formatSheetDate } from "@/lib/date-utils"

function formatDate(value: string) {
  return formatSheetDate(value)
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 text-sm md:grid-cols-[12rem_minmax(0,1fr)]">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words font-medium text-foreground md:text-right">{value || "-"}</span>
    </div>
  )
}

export function TransfertDetail({
  transfert,
  onBack,
}: {
  transfert: Transfert
  onBack: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="size-4" /> Retour aux mouvements
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-foreground">{transfert.athleteNom || "Transfert"}</h1>
            <p className="font-mono text-sm text-muted-foreground">{transfert.id || "-"}</p>
          </div>
        </div>
        <StatusBadge status={transfert.statut} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              Parcours du transfert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] md:items-center">
              <div className="rounded-md border p-4">
                <p className="text-xs uppercase text-muted-foreground">Club d&apos;origine</p>
                <p className="mt-1 font-semibold">{transfert.clubOrigineNom || "-"}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{transfert.clubOrigineId || "-"}</p>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs uppercase text-muted-foreground">Club beneficiaire</p>
                <p className="mt-1 font-semibold">{transfert.clubBeneficiaireNom || "-"}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{transfert.clubBeneficiaireId || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-primary" />
              Athlète
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Nom" value={transfert.athleteNom} />
            <InfoRow label="ID athlète" value={transfert.athleteId} />
            <InfoRow label="Matricule transfert" value={transfert.id} />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-5 w-5 text-primary" />
              Dates et saison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Saison" value={transfert.saison} />
            <InfoRow label="Debut" value={formatDate(transfert.dateDebut)} />
            <InfoRow label="Fin" value={formatDate(transfert.dateFin)} />
            <InfoRow label="Validation" value={formatDate(transfert.dateValidation)} />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Type" value={transfert.typeTransfert} />
            <InfoRow label="Statut" value={transfert.statut} />
            <InfoRow label="Observation" value={transfert.observation} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
