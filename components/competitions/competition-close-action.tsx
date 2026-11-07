"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LockKeyhole } from "lucide-react"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function CompetitionCloseAction({ competitionId, closed }: { competitionId: string; closed: boolean }) {
  const router = useRouter(), [pending, setPending] = useState(false), [issues, setIssues] = useState<string[]>([])
  if (closed) return <div className="flex items-center gap-2 rounded-lg border border-brand-gold/30 bg-brand-gold/5 px-3 py-2 text-sm text-brand-gold"><LockKeyhole className="size-4" />Édition clôturée — lecture seule</div>
  async function close() {
    setPending(true); setIssues([])
    try {
      const response = await fetch(`/api/competitions/${encodeURIComponent(competitionId)}/close`, { method: "POST" }), payload = await response.json()
      if (!response.ok) { const found = Object.values(payload.fields ?? {}).map(String); setIssues(found); throw new Error(payload.error ?? "Clôture impossible.") }
      toast.success("Compétition clôturée"); router.refresh()
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Clôture impossible.") } finally { setPending(false) }
  }
  return <div className="space-y-2"><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive"><LockKeyhole className="size-4" />Clôturer l’édition</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Clôturer définitivement cette édition ?</AlertDialogTitle><AlertDialogDescription>Les données resteront consultables, mais toutes les créations et modifications ordinaires seront bloquées. Cette action ne rouvre pas automatiquement une édition.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={close} disabled={pending} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90">{pending ? "Contrôle..." : "Contrôler et clôturer"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>{issues.length ? <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"><p className="font-medium">Anomalies à corriger :</p><ul className="mt-2 list-disc space-y-1 pl-5">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div> : null}</div>
}
