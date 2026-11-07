"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type AvatarActorType = "athlete" | "coach" | "arbitre" | "medecin" | "officiel"

export function AvatarFileField({ editing, onFileChange }: {
  editing: boolean
  onFileChange: (file: File | null) => void
}) {
  return (
    <div className="space-y-2 sm:col-span-2">
      <Label>{editing ? "Remplacer l’avatar" : "Avatar"}</Label>
      <Input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
      />
      <p className="text-xs text-muted-foreground">
        JPEG, PNG ou WebP — 5 Mo maximum. Le fichier sera renommé avec l’identifiant de l’acteur.
      </p>
    </div>
  )
}

export async function uploadAvatarFile(actorType: AvatarActorType, actorId: string, file: File) {
  const data = new FormData()
  data.set("avatar", file)
  const response = await fetch(`/api/actors/${actorType}/${encodeURIComponent(actorId)}/avatar`, {
    method: "POST",
    body: data,
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || "L’avatar n’a pas pu être enregistré.")
  return result.actor
}
