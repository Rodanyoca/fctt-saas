import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ClubsClient } from "@/components/clubs/clubs-client"
import { getAthletes, getClubs, getEntentes } from "@/lib/data"
import type { Athlete, Club, Entente } from "@/lib/types"
import { getClubCategories, getClubSexes } from "@/lib/club-references"
import type { ClubReferenceOption } from "@/lib/club-references"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function ClubsPage() {
  const loaded = await Promise.allSettled([
    getClubs(), getAthletes(), getEntentes(), getClubCategories(), getClubSexes(),
  ])
  const [clubs, athletes, ententes, categories, sexes] = loaded.map((result) => result.status === "fulfilled" ? result.value : []) as [Club[], Athlete[], Entente[], ClubReferenceOption[], ClubReferenceOption[]]

  return (
    <DashboardLayout>
      <ClubsClient clubs={clubs} athletes={athletes} ententes={ententes} categories={categories} sexes={sexes} dataLoadError={loaded.some((result) => result.status === "rejected")} />
    </DashboardLayout>
  )
}
