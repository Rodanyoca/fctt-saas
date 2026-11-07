"use client"

import { ArrowLeft, Contact, Info, User } from "lucide-react"
import { AutreActeurFormDialog } from "@/components/autres-acteurs/autre-acteur-form-dialog"
import { Button } from "@/components/ui/button"
import { DetailCard } from "@/components/dashboard/detail-card"
import { formatDateForDisplay } from "@/lib/compact-date"
import type { ActorSexOption } from "@/lib/actor-references"
import type { AutreActeur, TypeAutreActeur } from "@/lib/types"

export function AutreActeurDetail({ acteur, sexes, types, onBack, onUpdated }: { acteur: AutreActeur; sexes: ActorSexOption[]; types: TypeAutreActeur[]; onBack: () => void; onUpdated: (item: AutreActeur) => void }) {
  const passport = Boolean(acteur.numeroPasseport || acteur.dateDelivrancePasseport || acteur.dateExpirationPasseport)
  return <div className="w-full space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 size-4" />Retour à la liste</Button><AutreActeurFormDialog acteur={acteur} sexes={sexes} types={types} onSaved={onUpdated} /></div>
    <div className="grid gap-6 md:grid-cols-2">
      <DetailCard title="Identité" icon={User} fields={[
        { label: "Identifiant", value: acteur.idAutreActeur },
        { label: "Nom complet", value: acteur.nomComplet },
        { label: "Sexe", value: acteur.sexe },
        { label: "Date de naissance", value: formatDateForDisplay(acteur.dateNaissance) || "Non renseignée" },
        { label: "Lieu de naissance", value: acteur.lieuNaissance },
        { label: "Nationalité", value: acteur.nationalite },
        { label: "Type", value: acteur.typeAutreActeur },
        { label: "Statut", value: acteur.statut },
        ...(passport ? [
          { label: "NÂ° de passeport", value: acteur.numeroPasseport },
          { label: "Passeport délivré le", value: formatDateForDisplay(acteur.dateDelivrancePasseport) || "Non renseignée" },
          { label: "Passeport expirant le", value: formatDateForDisplay(acteur.dateExpirationPasseport) || "Non renseignée" },
        ] : []),
      ]} />
      <DetailCard title="Coordonnées" icon={Contact} fields={[{ label: "Téléphone", value: acteur.telephone }, { label: "Courriel", value: acteur.email }, { label: "Adresse", value: acteur.adresse }]} />
      <DetailCard title="Observations" icon={Info} fields={[{ label: "Remarques", value: acteur.observations }]} />
    </div>
  </div>
}
