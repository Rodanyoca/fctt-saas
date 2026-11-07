"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DetailCard } from "@/components/dashboard/detail-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import { calculateAge, formatSheetDate } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { Athlete, AthleteAffiliation, AthleteLicence } from "@/lib/types"
import { AffiliationSection, LicenceSection } from "@/components/actors/record-sections"
import { ArrowLeft, Contact, Fingerprint, Info, User } from "lucide-react"
import { AthleteFormDialog } from "@/components/athletes/athlete-form-dialog"
import type { SavedAthlete } from "@/components/athletes/athlete-form-dialog"
import type { ActorSexOption } from "@/lib/actor-references"

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

export function AthleteDetail({ athlete, affiliations, licences, sexes, onRefreshAffiliations, onUpdated, onBack }: {
  athlete: Athlete
  affiliations: AthleteAffiliation[]
  licences: AthleteLicence[]
  sexes: ActorSexOption[]
  onRefreshAffiliations: () => Promise<void>
  onUpdated: (athlete: SavedAthlete) => void
  onBack: () => void
}) {
  const [refreshingAffiliations, setRefreshingAffiliations] = useState(false)
  const refreshAffiliations = async () => {
    setRefreshingAffiliations(true)
    try {
      await onRefreshAffiliations()
      toast.success("Affiliations actualisées.")
    } catch {
      toast.error("Actualisation des affiliations impossible.")
    } finally {
      setRefreshingAffiliations(false)
    }
  }
  const avatarUrl = getActorAvatarUrl(athlete.avatarDriveUrl, athlete.avatarDriveId)
  const age = calculateAge(athlete.dateDeNaissance)
  const dateNaissance = formatSheetDate(athlete.dateDeNaissance)

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
        <AthleteFormDialog athlete={athlete} sexes={sexes} onSaved={onUpdated} />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-20 shrink-0">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={athlete.nomComplet} />}
                <AvatarFallback className="text-lg">{initials(athlete.nomComplet)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-bold">{shown(athlete.nomComplet)}</h2>
                <p className="mt-1 break-all font-mono text-sm text-muted-foreground">{shown(athlete.idAthlete)}</p>
              </div>
            </div>
            <StatusBadge status={athlete.statut} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="gap-4">
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="general" className="w-full">Général</TabsTrigger>
          <TabsTrigger value="affiliation" className="w-full">Affiliations</TabsTrigger>
          <TabsTrigger value="licence" className="w-full">Licence</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <DetailCard
              title="Identité"
              icon={User}
              fields={[
                { label: "Nom complet", value: athlete.nomComplet },
                { label: "Sexe", value: sexeLabel(athlete.sexe) },
                { label: "Date de naissance", value: dateNaissance === "-" ? "—" : dateNaissance },
                { label: "Âge", value: age === null ? "—" : `${age} ans` },
                { label: "Lieu de naissance", value: athlete.lieuNaissance },
                { label: "Nationalité", value: athlete.nationalite },
              ]}
            />
            <DetailCard
              title="Contact"
              icon={Contact}
              fields={[
                { label: "Téléphone", value: athlete.telephone },
                { label: "E-mail", value: athlete.email },
                { label: "Adresse", value: athlete.adresse },
              ]}
            />
            <DetailCard
              title="Identifiants"
              icon={Fingerprint}
              fields={[
                { label: "ID athlète", value: athlete.idAthlete },
                { label: "ID national", value: athlete.idNational },
                
                { label: "Statut", value: athlete.statut },
              ]}
            />
            <DetailCard
              title="Observations"
              icon={Info}
              fields={[{ label: "Remarques", value: athlete.observations }]}
            />
          </div>
        </TabsContent>

        <TabsContent value="affiliation" className="[&>section]:border-t-0 [&>section]:pt-0">
          <AffiliationSection
            affiliations={affiliations}
            actorId={athlete.idAthlete}
            action={<Button type="button" variant="outline" size="sm" disabled={refreshingAffiliations} onClick={refreshAffiliations}>{refreshingAffiliations ? "Actualisation..." : "Actualiser"}</Button>}
          />
        </TabsContent>
        <TabsContent value="licence" className="[&>section]:border-t-0 [&>section]:pt-0">
          <LicenceSection licences={licences} actorId={athlete.idAthlete} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
