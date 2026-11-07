import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function DocumentsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardLayout>{children}</DashboardLayout>
}
