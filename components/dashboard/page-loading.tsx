import { Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"

interface PageLoadingProps {
  title: string
  subtitle: string
}

export function PageLoading({ title, subtitle }: PageLoadingProps) {
  return (
    <DashboardLayout>
      <Header title={title} subtitle={subtitle} />
      <main className="p-4 sm:p-6">
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          <Loader2
            className="mr-2 inline size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          Chargementâ€¦
        </p>
      </main>
    </DashboardLayout>
  )
}
