import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subIndicators?: { label: string; value: string | number }[]
  trend?: {
    value: number
    positive: boolean
  }
  variant?: "default" | "primary" | "secondary" | "accent"
}

export function KpiCard({ title, value, icon: Icon, subIndicators, trend, variant = "default" }: KpiCardProps) {
  const variantStyles = {
    default: "bg-card text-card-foreground",
    primary: "bg-card text-card-foreground",
    secondary: "bg-card text-card-foreground",
    accent: "bg-card text-card-foreground",
  }

  const iconStyles = {
    default: "bg-muted text-primary",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
  }

  return (
    <Card className={cn("border-0 shadow-sm", variantStyles[variant])}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn(
              "text-xs font-medium uppercase tracking-wider mb-1",
              variant === "default" ? "text-muted-foreground" : "opacity-80"
            )}>
              {title}
            </p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            {subIndicators && subIndicators.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {subIndicators.map((s) => `${s.label}: ${s.value.toLocaleString()}`).join(" â€¢ ")}
              </p>
            )}
            {trend && (
              <p className={cn(
                "text-xs mt-1",
                trend.positive ? "text-success" : "text-destructive"
              )}>
                {trend.positive ? "+" : ""}{trend.value}% vs mois dernier
              </p>
            )}
          </div>
          <div className={cn("p-2.5 rounded-lg", iconStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
