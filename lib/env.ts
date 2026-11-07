/** Legacy adapters disabled. FCTT readers use lib/fctt/config.ts exclusively. */
export const env = { googleSheets: {
  spreadsheetId: "",
  territorialSpreadsheetId: "",
  acteursSpreadsheetId: "",
  affiliationsSpreadsheetId: "",
  licencesSpreadsheetId: "",
  competitionsSpreadsheetId: "",
  activitiesSpreadsheetId: "",
  documentsSpreadsheetId: "",
  equipeNationaleSpreadsheetId: "",
  referentielsSpreadsheetId: "",
  documentsDriveFolderId: "", clubLogosDriveFolderId: "", clientEmail: "", privateKey: "",
} } as const
export function isGoogleSheetsConfigured(): boolean { return false }
export function isTerritorialGoogleSheetsConfigured(): boolean { return false }
export function isActeursGoogleSheetsConfigured(): boolean { return false }
export function isAffiliationsGoogleSheetsConfigured(): boolean { return false }
export function isLicencesGoogleSheetsConfigured(): boolean { return false }
export function isCompetitionsGoogleSheetsConfigured(): boolean { return false }
export function isActivitiesGoogleSheetsConfigured(): boolean { return false }
export function isDocumentsGoogleSheetsConfigured(): boolean { return false }
export function isEquipeNationaleGoogleSheetsConfigured(): boolean { return false }
