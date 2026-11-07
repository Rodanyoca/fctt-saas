"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DetailCard } from "@/components/dashboard/detail-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import { calculateAge, formatSheetDate } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { BaseActorLicence, Coach, CoachAffiliation } from "@/lib/types"
import { AffiliationSection, LicenceSection } from "@/components/actors/record-sections"
import { ArrowLeft, Contact, Fingerprint, UserCog } from "lucide-react"
import { CoachFormDialog } from "@/components/coachs/coach-form-dialog"
import type { SavedCoach } from "@/components/coachs/coach-form-dialog"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"
import { CoachAffiliationFormDialog } from "@/components/coachs/coach-affiliation-form-dialog"
import type { CoachStructureOption } from "@/components/coachs/coach-affiliation-form-dialog"
import { CoachLicenceFormDialog } from "@/components/coachs/coach-licence-form-dialog"

function shown(value: unknown, fallback = "Non renseigné") {
  const text = value === null || value === undefined ? "" : String(value).trim()
  return text || fallback
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase()
}

function sexeLabel(value: string) {
  const sexe = normalize(value)
  if (sexe === "M" || sexe === "MASCULIN") return "Masculin"
  if (sexe === "F" || sexe === "FEMININ") return "Féminin"
  return shown(value)
}

export function CoachDetail({ coach, affiliations, licences, sexes, levels, structures, affiliationTypes, coachFunctions, onAffiliationCreated, onLicenceCreated, onUpdated, onBack }: {
  coach: Coach
  affiliations: CoachAffiliation[]
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
  levels: CoachReferenceOption[]
  structures: CoachStructureOption[]
  affiliationTypes: CoachReferenceOption[]
  coachFunctions: CoachReferenceOption[]
  onAffiliationCreated: (affiliation: CoachAffiliation, deactivatedAffiliationId: string) => void
  onLicenceCreated: (licence: BaseActorLicence, deactivatedLicenceId: string) => void
  onUpdated: (coach: SavedCoach) => void
  onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState("general")
  const avatarUrl = getActorAvatarUrl(coach.avatarDriveUrl, coach.avatarDriveId)
  const age = calculateAge(coach.dateNaissance)
  const formattedDate = formatSheetDate(coach.dateNaissance)
  const affiliationKind = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "_").toUpperCase()
  const clubAffiliations = affiliations.filter((item) => !item.typeAffiliation || affiliationKind(item.typeAffiliation) === "CLUB")

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
        {activeTab === "general" && <CoachFormDialog coach={coach} sexes={sexes} levels={levels} onSaved={onUpdated} />}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-20 shrink-0">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={coach.nomComplet} />}
                <AvatarFallback className="text-lg">{initials(coach.nomComplet)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-bold">{shown(coach.nomComplet)}</h2>
                <p className="mt-1 break-all font-mono text-sm text-muted-foreground">{shown(coach.idCoach)}</p>
              </div>
            </div>
            <StatusBadge status={coach.statut} />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="general" className="w-full">Général</TabsTrigger>
          <TabsTrigger value="affiliation" className="w-full">Affiliations</TabsTrigger>
          <TabsTrigger value="licence" className="w-full">Licence</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <DetailCard
              title="Identité"
              icon={UserCog}
              fields={[
                { label: "ID", value: coach.idCoach },
                { label: "Nom complet", value: coach.nomComplet },
                { label: "Sexe", value: sexeLabel(coach.sexe) },
                { label: "Date de naissance", value: formattedDate === "-" ? "—" : formattedDate },
                { label: "Âge", value: age === null ? "—" : `${age} ans` },
                { label: "Lieu de naissance", value: coach.lieuNaissance },
                { label: "Nationalité", value: coach.nationalite },
                { label: "Niveau", value: coach.niveau },
              ]}
            />
            <DetailCard
              title="Identifiants"
              icon={Fingerprint}
              fields={[
                { label: "ID entraîneur", value: coach.idCoach },
                { label: "ID national", value: coach.idNational },
                
                { label: "Statut", value: coach.statut },
              ]}
            />
            <DetailCard
              title="Contact"
              icon={Contact}
              fields={[
                { label: "Téléphone", value: coach.telephone },
                { label: "E-mail", value: coach.email },
                { label: "Adresse", value: coach.adresse },
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="affiliation" className="space-y-8 [&_section:first-of-type]:border-t-0 [&_section:first-of-type]:pt-0">
          <div className="flex justify-end"><CoachAffiliationFormDialog coach={coach} structures={structures} affiliationTypes={affiliationTypes} coachFunctions={coachFunctions} onSaved={onAffiliationCreated} /></div>
          <AffiliationSection affiliations={clubAffiliations} actorId={coach.idCoach} title="Affiliations" description="Club actuel et historique des affiliations" />
        </TabsContent>

        <TabsContent value="licence" className="[&>section]:border-t-0 [&>section]:pt-0">
          <LicenceSection
            licences={licences}
            actorId={coach.idCoach}
            showId={false}
            action={<CoachLicenceFormDialog coach={coach} hasAffiliation={affiliations.some((item) => item.actorId === coach.idCoach)} onSaved={onLicenceCreated} />}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
