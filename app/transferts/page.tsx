import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { TransfertsClient } from "@/components/transferts/transferts-client"
import { getAthletes, getClubs, getTransferts } from "@/lib/data"
import { getTransferTypes } from "@/lib/actor-references"
import { ActorsLoadNotice } from "@/components/actors/actors-load-notice"
import { safeDataLoad } from "@/lib/safe-data-load"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function TransfertsPage() {
  const [transferts, athletes, clubs, transferTypes] = await Promise.all([
    safeDataLoad(getTransferts, []), safeDataLoad(getAthletes, []),
    safeDataLoad(getClubs, []), safeDataLoad(getTransferTypes, []),
  ])

  return (
    <DashboardLayout>
      <Header title="Mouvements" subtitle="Affiliations et transferts des athlètes entre clubs FEACO" />
      <main className="space-y-6 p-4 sm:p-6">
        <ActorsLoadNotice errors={[transferts.error, athletes.error, clubs.error, transferTypes.error]} />
        <TransfertsClient transferts={transferts.data} athletes={athletes.data} clubs={clubs.data} transferTypes={transferTypes.data} />
      </main>
    </DashboardLayout>
  )
}
