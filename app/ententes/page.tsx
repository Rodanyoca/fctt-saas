import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { EntentesClient } from "@/components/ententes/ententes-client"
import { getAthletes, getClubs, getEntentes, getLigues } from "@/lib/data"
import type { Athlete, Club, Entente, Ligue } from "@/lib/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function EntentesPage() {
  const loaded = await Promise.allSettled([
    getEntentes(),
    getClubs(),
    getAthletes(),
    getLigues(),
  ])
  const [ententes, clubs, athletes, ligues] = loaded.map((result) => result.status === "fulfilled" ? result.value : []) as [Entente[], Club[], Athlete[], Ligue[]]

  return (
    <DashboardLayout>
      <EntentesClient ententes={ententes} ligues={ligues} clubs={clubs} athletes={athletes} dataLoadError={loaded.some((result) => result.status === "rejected")} />
    </DashboardLayout>
  )
}
