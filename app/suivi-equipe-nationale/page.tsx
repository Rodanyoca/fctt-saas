import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
export default function NationalPerformancePage() { return <DashboardLayout><Header title="Suivi des équipes nationales" subtitle="Performances athlétisme" /><main className="space-y-6 p-4 sm:p-6"><Card><CardHeader><CardTitle>Résultats et performances</CardTitle></CardHeader><CardContent><p role="status" className="p-8 text-center text-muted-foreground">Le suivi des temps, distances, hauteurs et relais attend la validation du référentiel athlétisme.</p></CardContent></Card></main></DashboardLayout> }
