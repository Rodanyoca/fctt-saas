import { env } from "@/lib/env"
import { updateSheetRecordById } from "@/lib/google-sheets"
import { competitionData, loadCompetitionBundle } from "@/lib/competitions-v2"
import { competitionClosureIssues } from "@/lib/competition-closure-rules"
import { CompetitionDomainError } from "@/lib/competition-structure"

export async function closeCompetition(competitionId: string) {
  const bundle = await loadCompetitionBundle(), detail = competitionData(bundle, competitionId)
  if (!detail) throw new CompetitionDomainError("Compétition introuvable.", 404)
  if (detail.competition.statut === "TERMINEE") return { id: competitionId, alreadyClosed: true, issues: [] }
  const issues = competitionClosureIssues({ events: detail.epreuves, phases: detail.phases, groups: detail.groupes, phaseUnits: detail.phasesUnites, matches: detail.matches, results: detail.resultats, standings: detail.classements })
  if (issues.length) throw new CompetitionDomainError("La compétition ne peut pas être clôturée.", 409, Object.fromEntries(issues.map((issue, index) => [`issue_${index + 1}`, issue])))
  await updateSheetRecordById(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS", "id_competition", competitionId, { statut: "TERMINEE" })
  return { id: competitionId, alreadyClosed: false, issues: [] }
}
