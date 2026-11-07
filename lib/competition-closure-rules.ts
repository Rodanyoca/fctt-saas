export type ClosureRow = Record<string, string | number | boolean | null>
const clean = (value: unknown) => String(value ?? "").trim()

export function competitionClosureIssues(data: { events: ClosureRow[]; phases: ClosureRow[]; groups: ClosureRow[]; phaseUnits: ClosureRow[]; matches: ClosureRow[]; results: ClosureRow[]; standings: ClosureRow[] }) {
  const issues: string[] = []
  if (!data.events.length) issues.push("La compétition doit contenir au moins une épreuve.")
  const eventIds = new Set(data.events.map((row) => clean(row.id_epreuve_competition)))
  if (data.phases.some((row) => !eventIds.has(clean(row.id_epreuve_competition)))) issues.push("Une phase référence une épreuve étrangère ou absente.")
  const phaseIds = new Set(data.phases.map((row) => clean(row.id_phase_competition)))
  if (data.groups.some((row) => !phaseIds.has(clean(row.id_phase_competition)))) issues.push("Un groupe référence une phase absente.")
  const resultMatchIds = new Set(data.results.map((row) => clean(row.id_match)))
  if (data.matches.some((row) => clean(row.statut_match) === "TERMINE" && !resultMatchIds.has(clean(row.id_match)))) issues.push("Un match terminé ne possède aucun résultat.")
  for (const phase of data.phases.filter((row) => clean(row.id_mode_phase) === "MPH001" && clean(row.statut) === "ACTIF")) {
    const phaseId = clean(phase.id_phase_competition), phaseGroups = data.groups.filter((row) => clean(row.id_phase_competition) === phaseId && clean(row.statut) === "ACTIF")
    if (!phaseGroups.length) issues.push(`La phase « ${clean(phase.nom_phase) || phaseId} » ne possède aucun groupe actif.`)
    for (const group of phaseGroups) {
      const groupId = clean(group.id_groupe), unitIds = new Set(data.phaseUnits.filter((row) => clean(row.id_phase_competition) === phaseId && clean(row.id_groupe) === groupId && clean(row.statut) === "ACTIF").map((row) => clean(row.id_unite_competition))), ranked = new Set(data.standings.filter((row) => clean(row.id_phase_competition) === phaseId && clean(row.id_groupe) === groupId).map((row) => clean(row.id_unite_competition)))
      if ([...unitIds].some((unitId) => !ranked.has(unitId))) issues.push(`Le classement du groupe « ${clean(group.nom_groupe) || groupId} » est incomplet.`)
    }
  }
  return [...new Set(issues)]
}
