import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Header } from '@/components/dashboard/header'
export function PendingPage({ title, message = 'Ce module sera raccordé dans un prochain lot. Aucune donnée de démonstration n’est chargée.' }: { title: string; message?: string }) {
  return <DashboardLayout><Header title={title} /><div className="p-6"><section className="rounded-xl border p-6"><h2 className="text-lg font-semibold">Bientôt disponible</h2><p className="mt-2 text-muted-foreground">{message}</p></section></div></DashboardLayout>
}
