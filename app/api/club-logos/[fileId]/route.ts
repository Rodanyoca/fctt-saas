import { NextResponse } from "next/server"
export async function GET() { return NextResponse.json({ error: "Fichier non connecté dans la démonstration locale FEACO." }, { status: 404 }) }
