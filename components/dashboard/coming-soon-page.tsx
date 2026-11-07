import { CalendarDays, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"

const icons = { activity: CalendarDays, document: FileText }

export function ComingSoonPage({ title, description, icon }: { title: string; description: string; icon: keyof typeof icons }) {
  const Icon = icons[icon]
  return (
    <DashboardLayout>
      <Header title={title} subtitle={description} />
      <main className="p-4 sm:p-6">
        <Card className="min-h-[22rem] justify-center" role="status" aria-labelledby="coming-soon-title">
          <CardContent className="mx-auto flex max-w-lg flex-col items-center py-12 text-center">
            <span className="mb-5 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Icon className="size-8" aria-hidden="true" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Module en préparation</p>
            <h2 id="coming-soon-title" className="mt-2 text-2xl font-bold tracking-tight">Bientôt disponible</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Cette section sera activée lorsqu’elle disposera de données et de services FEACO validés.</p>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  )
}
