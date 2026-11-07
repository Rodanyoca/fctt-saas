"use client"

import { useState } from "react"
import { Activity, ArrowLeft, Contact, FileKey, Stethoscope } from "lucide-react"
import { AffiliationSection, LicenceSection } from "@/components/actors/record-sections"
import { MedecinAffiliationFormDialog, type MedecinStructureOption } from "@/components/medecins/medecin-affiliation-form-dialog"
import { MedecinFormDialog, type SavedMedecin } from "@/components/medecins/medecin-form-dialog"
import { MedecinLicenceFormDialog } from "@/components/medecins/medecin-licence-form-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DetailCard } from "@/components/dashboard/detail-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"
import { formatDateForDisplay } from "@/lib/compact-date"
import { calculateAge } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { BaseActorLicence, Medecin, MedecinAffiliation } from "@/lib/types"

function shown(value: unknown) { return String(value ?? "").trim() || "Non renseigné" }
function initials(name: string) { const parts = name.trim().split(/\s+/).filter(Boolean); return parts.length ? `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase() : "MD" }
function sexeLabel(value: string) { const sexe = normalize(value); return sexe === "M" || sexe === "MASCULIN" ? "Masculin" : sexe === "F" || sexe === "FEMININ" ? "Féminin" : shown(value) }
const affiliationKind = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "_").toUpperCase()

export function MedecinDetail({ medecin, affiliations, licences, sexes, specialties, structures, affiliationTypes, onAffiliationCreated, onLicenceCreated, onUpdated, onBack }: {
  medecin: Medecin; affiliations: MedecinAffiliation[]; licences: BaseActorLicence[]; sexes: ActorSexOption[]
  specialties: CoachReferenceOption[]; structures: MedecinStructureOption[]; affiliationTypes: CoachReferenceOption[]
  onAffiliationCreated: (affiliation: MedecinAffiliation, deactivatedAffiliationId: string) => void
  onLicenceCreated: (licence: BaseActorLicence, deactivatedLicenceId: string) => void
  onUpdated: (medecin: SavedMedecin) => void; onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState("general")
  const avatarUrl = getActorAvatarUrl(medecin.avatarDriveUrl, medecin.avatarDriveId)
  const age = calculateAge(medecin.dateDeNaissance)
  const clubAffiliations = affiliations.filter((item) => !item.typeAffiliation || affiliationKind(item.typeAffiliation) === "CLUB")
  const hasContact = Boolean(medecin.telephone || medecin.email || medecin.adresse)
  const hasPassport = Boolean(medecin.numeroPasseport || medecin.dateDelivrancePasseport || medecin.dateExpirationPasseport)

  return <div className="w-full space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 size-4" />Retour à la liste</Button>{activeTab === "general" && <MedecinFormDialog medecin={medecin} sexes={sexes} specialties={specialties} onSaved={onUpdated} />}</div>
    <Card><CardContent className="p-6"><div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4"><Avatar className="size-20 shrink-0">{avatarUrl && <AvatarImage src={avatarUrl} alt={medecin.nomComplet} />}<AvatarFallback className="text-lg">{initials(medecin.nomComplet)}</AvatarFallback></Avatar><div className="min-w-0"><h2 className="break-words text-2xl font-bold">{shown(medecin.nomComplet)}</h2><p className="mt-1 text-sm text-muted-foreground">{shown(medecin.specialite)}</p></div></div>
      <div className="flex flex-col items-end gap-2"><StatusBadge status={medecin.statut} /><p className="font-mono text-sm text-muted-foreground">{shown(medecin.idMedecin)}</p></div>
    </div></CardContent></Card>

    <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
      <TabsList className="grid h-auto w-full grid-cols-3"><TabsTrigger value="general">Général</TabsTrigger><TabsTrigger value="affiliations">Affiliations</TabsTrigger><TabsTrigger value="licences">Licences</TabsTrigger></TabsList>
      <TabsContent value="general"><div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
        <DetailCard title="Identité" icon={Stethoscope} fields={[{ label: "ID médecin", value: medecin.idMedecin }, { label: "Nom complet", value: medecin.nomComplet }, { label: "Sexe", value: sexeLabel(medecin.sexe) }, { label: "Date de naissance", value: formatDateForDisplay(medecin.dateDeNaissance) || "Non renseignée" }, { label: "Âge", value: age === null ? "Non renseigné" : `${age} ans` }, { label: "Nationalité", value: medecin.nationalite }]} />
        <DetailCard title="Profil" icon={Activity} fields={[{ label: "Spécialité", value: medecin.specialite }, { label: "ID national", value: medecin.idNational },  { label: "Statut", value: medecin.statut }]} />
        {hasContact && <DetailCard title="Contact" icon={Contact} fields={[{ label: "Téléphone", value: medecin.telephone }, { label: "E-mail", value: medecin.email }, { label: "Adresse", value: medecin.adresse }]} />}
        {hasPassport && <DetailCard title="Passeport" icon={FileKey} fields={[{ label: "Numéro", value: medecin.numeroPasseport }, { label: "Délivré le", value: formatDateForDisplay(medecin.dateDelivrancePasseport) || "Non renseignée" }, { label: "Expire le", value: formatDateForDisplay(medecin.dateExpirationPasseport) || "Non renseignée" }]} />}
      </div></TabsContent>
      <TabsContent value="affiliations" className="space-y-8 [&_section:first-of-type]:border-t-0 [&_section:first-of-type]:pt-0"><div className="flex justify-end"><MedecinAffiliationFormDialog medecin={medecin} structures={structures} affiliationTypes={affiliationTypes} specialties={specialties} onSaved={onAffiliationCreated} /></div><AffiliationSection affiliations={clubAffiliations} actorId={medecin.idMedecin} title="Affiliations" description="Club actuel et historique des affiliations" /></TabsContent>
      <TabsContent value="licences" className="[&>section]:border-t-0 [&>section]:pt-0"><LicenceSection licences={licences} actorId={medecin.idMedecin} showId={false} action={<MedecinLicenceFormDialog medecin={medecin} hasAffiliation={affiliations.some((item) => item.actorId === medecin.idMedecin)} onSaved={onLicenceCreated} />} /></TabsContent>
    </Tabs>
  </div>
}
