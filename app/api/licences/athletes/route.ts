import { NextResponse } from "next/server"
import { createAthleteLicence } from "@/lib/athlete-licence-creation"
import { LicenceDomainError } from "@/lib/licences-domain"
import { isLicencesGoogleSheetsConfigured } from "@/lib/env"

export async function POST(request: Request) {
  if (!isLicencesGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur des licences n’est pas configuré." }, { status: 503 })
  try {
    const licence = await createAthleteLicence(await request.json())
    return NextResponse.json({ licence }, { status: 201 })
  } catch (error) {
    if (error instanceof LicenceDomainError) return NextResponse.json({ message: error.message, fields: error.fields }, { status: error.status })
    return NextResponse.json({ message: error instanceof Error ? error.message : "Création de la licence impossible." }, { status: 400 })
  }
}
