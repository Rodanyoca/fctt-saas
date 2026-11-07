"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CompetitionsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-[60vh] place-items-center p-6"><div className="max-w-md rounded-xl border border-destructive/30 bg-card p-6 text-center shadow-lg"><AlertTriangle className="mx-auto size-8 text-destructive" /><h2 className="mt-4 text-lg font-semibold">Données temporairement indisponibles</h2><p className="mt-2 text-sm text-muted-foreground">Google Sheets n’a pas répondu correctement. La page reste stable et peut être rechargée sans perdre les données enregistrées.</p><Button onClick={reset} className="mt-5 bg-brand-gold text-slate-950 hover:bg-brand-gold/90"><RefreshCw className="size-4" />Réessayer</Button></div></main>
}
