import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ActorsLoadNotice({ errors }: { errors: Array<string | null> }) {
  if (!errors.some(Boolean)) return null
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Données partiellement indisponibles</AlertTitle>
      <AlertDescription>Une partie des données Acteurs n’a pas pu être chargée depuis Google Sheets. Aucun contenu fictif n’est affiché.</AlertDescription>
    </Alert>
  )
}
