import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return <DashboardLayout><main className="space-y-6 p-6"><Skeleton className="h-10 w-64" /><div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div><Skeleton className="h-12 w-full" /><Skeleton className="h-80 w-full" /></main></DashboardLayout>
}
