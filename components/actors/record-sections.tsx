"use client"

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { formatSheetDate, parseSheetDate } from "@/lib/date-utils"
import {
  affiliationHistory,
  getCurrentAffiliationForActor,
  licenceHistory,
} from "@/lib/actor-record-utils"
import type { AthleteAffiliation, AthleteLicence, BaseActorAffiliation, BaseActorLicence } from "@/lib/types"

const value = (text: string) => text?.trim() || "Non renseigné"
const date = (text: string) => {
  const formatted = formatSheetDate(text)
  return formatted === "-" ? "Non renseignée" : formatted
}

export function ActorStatusBadge({ status }: { status: string }) {
  const normalized = status.trim().toUpperCase()
  const valid = ["ACTIF", "ACTIVE", "VALIDE", "VALIDEE", "EN COURS"].includes(normalized)
  const warning = ["A RENOUVELER", "À RENOUVELER", "EN ATTENTE"].includes(normalized)
  return <Badge variant={valid ? "default" : warning ? "outline" : "secondary"}>{value(status)}</Badge>
}

function Fields({
  fields,
  className = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  fields: Array<[string, string]>
  className?: string
}) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {fields.map(([label, content]) => (
        <div key={label} className="rounded-lg border bg-background p-4">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 break-words font-medium">{value(content)}</p>
        </div>
      ))}
    </div>
  )
}

export function AffiliationSection<T extends BaseActorAffiliation>({
  affiliations,
  actorId,
  action,
  title = "Affiliation",
  description = "Situation actuelle et historique",
  currentDetail,
  fieldsClassName,
}: {
  affiliations: T[]
  actorId: string
  action?: ReactNode
  title?: string
  description?: string
  currentDetail?: (affiliation: T) => [string, string]
  fieldsClassName?: string
}) {
  const history = affiliationHistory(affiliations, actorId)
  const current = getCurrentAffiliationForActor(affiliations, actorId)
  const currentStructureName = current && "nomClubBeneficiaire" in current
    ? String(current.nomClubBeneficiaire ?? "")
    : current?.nomStructure ?? ""
  const detail: [string, string] = current && currentDetail
    ? currentDetail(current)
    : ["Observation", current?.observation ?? ""]
  return (
    <section className="border-t pt-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{description}</p></div>{action}</div>
      {current ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/15 p-4">
            <div><p className="text-xs text-muted-foreground">Structure actuelle</p><p className="font-semibold">{value(currentStructureName)}</p></div>
            <ActorStatusBadge status={current.statutAffiliation} />
          </div>
          <Fields className={fieldsClassName} fields={[
            ["ID affiliation", current.idAffiliation],
            ["Début", date(current.dateDebut)],
            ["Fin", date(current.dateFin)],
            ...("saison" in current ? [["Saison", String(current.saison)]] as Array<[string, string]> : []),
            ...("typeAffiliation" in current ? [["Type", String(current.typeAffiliation)]] as Array<[string, string]> : []),
            detail,
          ]} />
        </div>
      ) : <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Aucune affiliation enregistrée.</p>}
      {history.length > 0 && (
        <div className="mt-6 space-y-2"><h3 className="text-sm font-semibold">Historique</h3>{history.map((item, index) => (
          <div key={item.idAffiliation || `${item.actorId}-${item.dateDebut}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
            <div><p className="font-medium">{value((item as unknown as AthleteAffiliation).nomClubBeneficiaire || item.nomStructure)}</p><p className="text-muted-foreground">{date(item.dateDebut)} — {date(item.dateFin)}</p></div>
            <ActorStatusBadge status={item.statutAffiliation} />
          </div>
        ))}</div>
      )}
    </section>
  )
}

export function LicenceSection({ licences, actorId, action, showId = true }: { licences: BaseActorLicence[]; actorId: string; action?: ReactNode; showId?: boolean }) {
  const history = licenceHistory(licences, actorId)
  const current = history.find((item) => {
    const end = parseSheetDate(item.dateFinValidite)
    return !item.dateFinValidite || Boolean(end && end.getTime() >= Date.now())
  }) ?? history[0]
  const athleteLicence = current as AthleteLicence | undefined
  return (
    <section className="border-t pt-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Licence</h2><p className="text-sm text-muted-foreground">Licence fédérale, validité et renouvellements</p></div>{action}</div>
      {current ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/15 p-4">
            <div><p className="text-xs text-muted-foreground">Numéro de licence</p><p className="font-semibold">{value(current.numeroLicence)}</p></div>
            <ActorStatusBadge status={current.statutLicence} />
          </div>
          <Fields
            className="sm:grid-cols-3"
            fields={[
              ...(showId ? [["ID licence", current.idLicence]] as Array<[string, string]> : []),
              ["Délivrée le", date(current.dateDelivrance)],
              ["Valable jusqu’au", date(current.dateFinValidite)],
              ...(athleteLicence?.saison ? [["Saison", athleteLicence.saison]] as Array<[string, string]> : []),
              ...(athleteLicence?.nomClub || athleteLicence?.idClub
                ? [["Club", athleteLicence.nomClub || athleteLicence.idClub]] as Array<[string, string]>
                : []),
              ...(athleteLicence?.idAffiliation
                ? [["ID affiliation", athleteLicence.idAffiliation]] as Array<[string, string]>
                : []),
              ["Licence précédente", current.numeroLicencePrecedente || current.idLicencePrecedente],
            ]}
          />
        </div>
      ) : <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Aucune licence enregistrée.</p>}
      {history.length > 0 && <div className="mt-6 space-y-2"><h3 className="text-sm font-semibold">Historique</h3>{history.map((item) => (
        <div key={item.idLicence} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
          <div><p className="font-medium">{value(item.numeroLicence)}</p><p className="text-muted-foreground">{date(item.dateDelivrance)} — {date(item.dateFinValidite)}</p></div>
          <ActorStatusBadge status={item.statutLicence} />
        </div>
      ))}</div>}
    </section>
  )
}
