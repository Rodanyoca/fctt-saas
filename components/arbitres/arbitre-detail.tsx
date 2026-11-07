"use client"

import { useState } from "react"
import { ArrowLeft, Contact, Fingerprint, Flag } from "lucide-react"
import { ArbitreFormDialog, type SavedArbitre } from "@/components/arbitres/arbitre-form-dialog"
import { ArbitreLicenceFormDialog } from "@/components/arbitres/arbitre-licence-form-dialog"
import { LicenceSection } from "@/components/actors/record-sections"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DetailCard } from "@/components/dashboard/detail-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"
import { calculateAge, formatSheetDate } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { Arbitre, BaseActorLicence } from "@/lib/types"

function shown(value: unknown, fallback = "Non renseigné") {
  const text = value === null || value === undefined ? "" : String(value).trim()
  return text || fallback
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.length ? `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase() : "?"
}

function sexeLabel(value: string) {
  const sexe = normalize(value)
  if (sexe === "M" || sexe === "MASCULIN") return "Masculin"
  if (sexe === "F" || sexe === "FEMININ") return "Féminin"
  return shown(value)
}

export function ArbitreDetail({ arbitre, licences, sexes, grades, onLicenceCreated, onUpdated, onBack }: {
  arbitre: Arbitre
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
  grades: CoachReferenceOption[]
  onLicenceCreated: (licence: BaseActorLicence, deactivatedLicenceId: string) => void
  onUpdated: (arbitre: SavedArbitre) => void
  onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState("general")
  const avatarUrl = getActorAvatarUrl(arbitre.avatarDriveUrl, arbitre.avatarDriveId)
  const age = calculateAge(arbitre.dateDeNaissance)
  const birthDate = formatSheetDate(arbitre.dateDeNaissance)

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste</Button>
        {activeTab === "general" && <ArbitreFormDialog arbitre={arbitre} sexes={sexes} grades={grades} onSaved={onUpdated} />}
      </div>

      <Card><CardContent className="p-6"><div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="size-20 shrink-0">{avatarUrl && <AvatarImage src={avatarUrl} alt={arbitre.nomComplet} />}<AvatarFallback className="text-lg">{initials(arbitre.nomComplet)}</AvatarFallback></Avatar>
          <div className="min-w-0"><h2 className="break-words text-2xl font-bold">{shown(arbitre.nomComplet)}</h2><p className="mt-1 text-sm text-muted-foreground">{shown(arbitre.grade)}</p></div>
        </div>
        <div className="flex flex-col items-end gap-2"><StatusBadge status={arbitre.statut} /><p className="font-mono text-sm text-muted-foreground">{shown(arbitre.idArbitre)}</p></div>
      </div></CardContent></Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList className="grid h-auto w-full grid-cols-2"><TabsTrigger value="general" className="w-full">Général</TabsTrigger><TabsTrigger value="licence" className="w-full">Licences</TabsTrigger></TabsList>
        <TabsContent value="general"><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <DetailCard title="Identité" icon={Flag} fields={[
            { label: "ID", value: arbitre.idArbitre }, { label: "Nom complet", value: arbitre.nomComplet },
            { label: "Sexe", value: sexeLabel(arbitre.sexe) }, { label: "Date de naissance", value: birthDate === "-" ? "—" : birthDate },
            { label: "Âge", value: age === null ? "—" : `${age} ans` }, { label: "Nationalité", value: arbitre.nationalite },
          ]} />
          <DetailCard title="Identifiants" icon={Fingerprint} fields={[
            { label: "ID national", value: arbitre.idNational }, 
            { label: "Grade", value: arbitre.grade }, { label: "Statut", value: arbitre.statut },
          ]} />
          <DetailCard title="Contact" icon={Contact} fields={[
            { label: "Téléphone", value: arbitre.telephone }, { label: "E-mail", value: arbitre.email }, { label: "Adresse", value: arbitre.adresse },
          ]} />
        </div></TabsContent>
        <TabsContent value="licence" className="[&>section]:border-t-0 [&>section]:pt-0">
          <LicenceSection licences={licences} actorId={arbitre.idArbitre} showId={false} action={<ArbitreLicenceFormDialog arbitre={arbitre} onSaved={onLicenceCreated} />} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
