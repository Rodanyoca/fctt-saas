import { EquipeNationaleClient } from "@/components/equipe-nationale/equipe-nationale-client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { getEquipeNationale, getEquipeNationaleCompetitions, getEquipeNationaleResultats, getEquipeNationaleSelections, getEquipeNationaleStaff } from "@/lib/data"
import { isEquipeNationaleGoogleSheetsConfigured } from "@/lib/env"
import { DataLoadNotice } from "@/components/dashboard/data-load-notice"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function EquipeNationalePage() {
  const loaded = await Promise.allSettled([
    getEquipeNationale(),
    getEquipeNationaleSelections(),
    getEquipeNationaleStaff(),
    getEquipeNationaleCompetitions(),
    getEquipeNationaleResultats(),
  ])
  const value = <T,>(index: number): T[] => loaded[index].status === "fulfilled" ? loaded[index].value as T[] : []
  const equipes = value<Awaited<ReturnType<typeof getEquipeNationale>>[number]>(0)
  const selections = value<Awaited<ReturnType<typeof getEquipeNationaleSelections>>[number]>(1)
  const staff = value<Awaited<ReturnType<typeof getEquipeNationaleStaff>>[number]>(2)
  const competitions = value<Awaited<ReturnType<typeof getEquipeNationaleCompetitions>>[number]>(3)
  const resultats = value<Awaited<ReturnType<typeof getEquipeNationaleResultats>>[number]>(4)

  return (
    <DashboardLayout>
      <Header title="Équipes nationales" subtitle="Sélections, staff, compétitions et résultats des Léopards RDC" />
      <main className="space-y-6 p-4 sm:p-6">
        {!isEquipeNationaleGoogleSheetsConfigured() && (
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-warning-foreground" role="status">
            Les équipes affichées sont des exemples locaux. Le référentiel national FEACO reste à connecter.
          </div>
        )}
        <DataLoadNotice visible={loaded.some((result) => result.status === "rejected")} description="Une partie des données des équipes nationales n’a pas pu être chargée. Les données disponibles restent affichées sans contenu fictif." />
        <EquipeNationaleClient equipes={equipes} selections={selections} staff={staff} competitions={competitions} resultats={resultats} />
      </main>
    </DashboardLayout>
  )
}
