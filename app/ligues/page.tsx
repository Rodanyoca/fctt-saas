import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LiguesClient } from "@/components/ligues/ligues-client"
import { getAthletes, getClubs, getEntentes, getLigues, getProvinceOptions } from "@/lib/data"
import type { Athlete, Club, Entente, Ligue, Province } from "@/lib/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function LiguesPage() {
  const results = await Promise.allSettled([
    getLigues(),
    getEntentes(),
    getClubs(),
    getAthletes(),
    getProvinceOptions(),
  ])
  const [ligues, ententes, clubs, athletes, provinces] = results.map((result) =>
    result.status === "fulfilled" ? result.value : [],
  ) as [Ligue[], Entente[], Club[], Athlete[], Province[]]

  const relationsReady = results.slice(1, 4).every((result) => result.status === "fulfilled")
  return (
    <DashboardLayout>
      <LiguesClient
        ligues={ligues}
        ententes={ententes}
        clubs={clubs}
        athletes={athletes}
        provinceOptions={provinces}
        relationsReady={relationsReady}
      />
    </DashboardLayout>
  )
}
