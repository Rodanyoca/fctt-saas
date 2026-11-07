import { Skeleton } from "@/components/ui/skeleton"
export default function Loading() { return <main className="space-y-6 p-4 sm:p-6"><Skeleton className="h-14 w-80" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div><Skeleton className="h-96" /></main> }
