import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() { return <main className="space-y-5 p-4 sm:p-6"><Skeleton className="h-10 w-72" /><Skeleton className="h-12 w-full" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28" />)}</div><Skeleton className="h-72 w-full" /></main> }
