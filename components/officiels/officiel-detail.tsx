"use client"

import { useState } from "react"
import { ArrowLeft, Contact, FileKey, IdCard, MessageSquareText } from "lucide-react"
import { AffiliationSection, LicenceSection } from "@/components/actors/record-sections"
import { OfficielAffiliationFormDialog, type OfficielStructureOption } from "@/components/officiels/officiel-affiliation-form-dialog"
import { OfficielFormDialog, type SavedOfficiel } from "@/components/officiels/officiel-form-dialog"
import { OfficielLicenceFormDialog } from "@/components/officiels/officiel-licence-form-dialog"
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
import type { BaseActorLicence, Officiel, OfficielAffiliation } from "@/lib/types"

const shown = (value: unknown) => String(value ?? "").trim() || "Non renseigné"
const initials = (name: string) => { const p = name.trim().split(/\s+/).filter(Boolean); return p.length ? `${p[0]?.[0] ?? ""}${p.at(-1)?.[0] ?? ""}`.toUpperCase() : "OF" }
const sexeLabel = (value: string) => { const v = normalize(value); return v === "M" || v === "MASCULIN" ? "Masculin" : v === "F" || v === "FEMININ" ? "Féminin" : shown(value) }

export function OfficielDetail({ officiel, affiliations, licences, sexes, structures, functions, structureTypes, seasons, onAffiliationCreated, onLicenceCreated, onUpdated, onBack }: {
  officiel: Officiel; affiliations: OfficielAffiliation[]; licences: BaseActorLicence[]; sexes: ActorSexOption[]
  structures: OfficielStructureOption[]; functions: CoachReferenceOption[]; structureTypes: CoachReferenceOption[]; seasons: CoachReferenceOption[]
  onAffiliationCreated: (item: OfficielAffiliation, deactivatedId: string) => void; onLicenceCreated: (item: BaseActorLicence, deactivatedId: string) => void
  onUpdated: (item: SavedOfficiel) => void; onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState("general")
  const avatarUrl = getActorAvatarUrl(officiel.avatarDriveUrl, officiel.avatarDriveId)
  const age = calculateAge(officiel.dateDeNaissance)
  const hasContact = Boolean(officiel.telephone || officiel.email || officiel.adresse)
  const hasPassport = Boolean(officiel.numeroPasseport || officiel.dateDelivrancePasseport || officiel.dateExpirationPasseport)
  const hasObservations = Boolean(officiel.observations)

  return <div className="w-full space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 size-4" />Retour à la liste</Button>{activeTab === "general" && <OfficielFormDialog officiel={officiel} sexes={sexes} onSaved={onUpdated} />}</div>
    <Card><CardContent className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-4"><Avatar className="size-20 shrink-0">{avatarUrl && <AvatarImage src={avatarUrl} alt={officiel.nomComplet} />}<AvatarFallback className="text-lg">{initials(officiel.nomComplet)}</AvatarFallback></Avatar><div className="min-w-0"><h2 className="break-words text-2xl font-bold">{shown(officiel.nomComplet)}</h2><p className="mt-1 font-mono text-sm text-muted-foreground">{shown(officiel.idOfficiel)}</p></div></div><StatusBadge status={officiel.statut} /></div></CardContent></Card>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
      <TabsList className="grid h-auto w-full grid-cols-3"><TabsTrigger value="general">Général</TabsTrigger><TabsTrigger value="mandats">Mandats</TabsTrigger><TabsTrigger value="licences">Licences</TabsTrigger></TabsList>
      <TabsContent value="general"><div className="grid w-full grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
        <DetailCard title="Identité" icon={IdCard} fields={[{label:"ID officiel",value:officiel.idOfficiel},{label:"Nom complet",value:officiel.nomComplet},{label:"Sexe",value:sexeLabel(officiel.sexe)},{label:"Date de naissance",value:formatDateForDisplay(officiel.dateDeNaissance)||"Non renseignée"},{label:"Âge",value:age===null?"Non renseigné":`${age} ans`},{label:"Lieu de naissance",value:officiel.lieuNaissance},{label:"Nationalité",value:officiel.nationalite}]} />
        <DetailCard title="Identifiants" icon={IdCard} fields={[{label:"ID national",value:officiel.idNational},{label:"Statut",value:officiel.statut}]} />
        {hasContact && <DetailCard title="Contact" icon={Contact} fields={[{label:"Téléphone",value:officiel.telephone},{label:"E-mail",value:officiel.email},{label:"Adresse",value:officiel.adresse}]} />}
        {hasPassport && <DetailCard title="Passeport" icon={FileKey} fields={[{label:"Numéro",value:officiel.numeroPasseport},{label:"Délivré le",value:formatDateForDisplay(officiel.dateDelivrancePasseport)||"Non renseignée"},{label:"Expire le",value:formatDateForDisplay(officiel.dateExpirationPasseport)||"Non renseignée"}]} />}
        {hasObservations && <DetailCard title="Observations" icon={MessageSquareText} fields={[{label:"Notes",value:officiel.observations}]} />}
      </div></TabsContent>
      <TabsContent value="mandats" className="space-y-6 [&_section:first-of-type]:border-t-0 [&_section:first-of-type]:pt-0"><div className="flex justify-end"><OfficielAffiliationFormDialog officiel={officiel} structures={structures} functions={functions} structureTypes={structureTypes} seasons={seasons} onSaved={onAffiliationCreated} /></div><AffiliationSection affiliations={affiliations} actorId={officiel.idOfficiel} title="Mandats" description="Mandat actuel et historique" fieldsClassName="sm:grid-cols-2 lg:grid-cols-4" currentDetail={(item)=>["Fonction / type de structure",[item.fonction,item.typeStructure].filter(Boolean).join(" · ")]} /></TabsContent>
      <TabsContent value="licences" className="[&>section]:border-t-0 [&>section]:pt-0"><LicenceSection licences={licences} actorId={officiel.idOfficiel} showId={false} action={<OfficielLicenceFormDialog officiel={officiel} hasAffiliation={affiliations.some(item=>item.actorId===officiel.idOfficiel)} onSaved={onLicenceCreated} />} /></TabsContent>
    </Tabs>
  </div>
}
