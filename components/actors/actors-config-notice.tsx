import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Database } from "lucide-react"

export function ActorsConfigNotice() {
  return (
    <Alert>
      <Database className="h-4 w-4" />
      <AlertTitle>Mode démonstration</AlertTitle>
      <AlertDescription>
        Les fiches affichées sont fictives. Le référentiel athlétisme reste à connecter.
      </AlertDescription>
    </Alert>
  )
}
