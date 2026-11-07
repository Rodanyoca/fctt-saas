import "server-only"

import { appendSheetRecord, updateSheetRecordById } from "@/lib/google-sheets"

type PreviousLicence = {
  idLicence: string
  numeroLicence: string
  statutLicence: string
}

export async function appendReplacingLicence({
  spreadsheetId,
  sheetName,
  previous,
  record,
}: {
  spreadsheetId: string
  sheetName: string
  previous?: PreviousLicence
  record: Record<string, string>
}) {
  if (previous) {
    await updateSheetRecordById(
      spreadsheetId,
      sheetName,
      "id_licence",
      previous.idLicence,
      { statut_licence: "INACTIF" },
    )
  }

  try {
    await appendSheetRecord(spreadsheetId, sheetName, {
      ...record,
      id_licence_precedente: previous?.idLicence ?? "",
      numero_licence_precedente: previous?.numeroLicence ?? "",
    })
  } catch (error) {
    if (previous) {
      await updateSheetRecordById(
        spreadsheetId,
        sheetName,
        "id_licence",
        previous.idLicence,
        { statut_licence: previous.statutLicence },
      )
    }
    throw error
  }
}
