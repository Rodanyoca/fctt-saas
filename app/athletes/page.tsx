import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { PlayersClient } from "@/components/fctt/players-client"
import { loadPlayers, PlayerReadError } from "@/lib/fctt/players-domain"
import { readFcttSheets } from "@/lib/fctt/sheets-server"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export default async function Page() {
  let content
  try { content = <PlayersClient players={await loadPlayers(readFcttSheets)} /> }
  catch (error) {
    const failure = error instanceof PlayerReadError ? error : new PlayerReadError("connection", "Lecture FCTT indisponible.")
    const title = failure.code === "configuration" ? "Configuration FCTT incomplète" : failure.code === "schema" ? "Schéma FCTT incompatible" : "Connexion FCTT indisponible"
    content = <div role="alert" className="space-y-3 rounded-xl border border-destructive/40 p-6"><h2 className="font-semibold">{title}</h2><p>{failure.message}</p><a href="/athletes" className="underline">Réessayer</a></div>
  }
  return <DashboardLayout><Header title="Joueurs" subtitle="Registre fédéral FCTT" /><div className="space-y-5 p-4 sm:p-6">{content}</div></DashboardLayout>
}
