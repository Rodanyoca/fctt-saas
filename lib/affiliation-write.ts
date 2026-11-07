import "server-only"

import { appendSheetRecord, updateSheetRecordById } from "@/lib/google-sheets"

export async function replaceActiveAffiliation({
  spreadsheetId,
  sheetName,
  previous,
  record,
}: {
  spreadsheetId: string
  sheetName: string
  previous?: { id: string; status: string; endDate?: string; replacementEndDate?: string }
  record: Record<string, string>
}) {
  if (previous) {
    await updateSheetRecordById(spreadsheetId, sheetName, "id_affiliation", previous.id, {
      statut_affiliation: "inactif",
      ...(previous.replacementEndDate ? { date_fin: previous.replacementEndDate } : {}),
    })
  }
  try {
    await appendSheetRecord(spreadsheetId, sheetName, record)
  } catch (error) {
    if (previous) {
      try {
        await updateSheetRecordById(spreadsheetId, sheetName, "id_affiliation", previous.id, {
          statut_affiliation: previous.status,
          ...(previous.replacementEndDate ? { date_fin: previous.endDate ?? "" } : {}),
        })
      } catch {
        // Preserve the original creation error; cache invalidation keeps the next read truthful.
      }
    }
    throw error
  }
}
