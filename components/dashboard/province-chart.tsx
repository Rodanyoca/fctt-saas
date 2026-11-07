"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Province } from "@/lib/types"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function ProvinceChart({ provinces }: { provinces: Province[] }) {
  const topProvinces = [...provinces]
    .sort((a, b) => (b.athletes ?? 0) - (a.athletes ?? 0))
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Top provinces - Athletes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProvinces} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="nom"
                axisLine={false}
                tickLine={false}
                width={100}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "var(--foreground)" }}
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              />
              <Bar dataKey="athletes" fill="var(--chart-1)" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
