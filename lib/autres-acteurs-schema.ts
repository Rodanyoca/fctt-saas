import { z } from "zod"
import { compareDateValues, formatDateForSheet, validateBirthDate } from "@/lib/compact-date"
import { normalizePhone, requiresOtherTypePrecision } from "@/lib/autres-acteurs-domain"

const optionalText = (maximum: number) => z.string().trim().max(maximum, `Maximum ${maximum} caractères.`)
const validDate = (value: string) => { try { formatDateForSheet(value); return true } catch { return false } }
const optionalDate = z.string().trim().refine((value) => !value || validDate(value), "Date invalide.")

export const autreActeurFormSchema = z.object({
  nomComplet: z.string().trim().min(1, "Le nom complet est obligatoire.").max(150),
  idSexe: z.string().trim().min(1, "Le sexe est obligatoire.").max(40),
  dateNaissance: z.string().trim().refine((value) => !value || !validateBirthDate(value), "La date de naissance est invalide ou future."),
  lieuNaissance: optionalText(120),
  nationalite: optionalText(80),
  idTypeAutreActeur: z.string().trim().min(1, "Le type d’autre acteur est obligatoire.").max(40),
  telephone: optionalText(40).transform(normalizePhone).refine((value) => !value || /^\+?\d{6,15}$/.test(value), "Le numéro de téléphone est invalide."),
  email: optionalText(160).refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "L’adresse e-mail est invalide."),
  adresse: optionalText(250),
  numeroPasseport: optionalText(80),
  dateDelivrancePasseport: optionalDate,
  dateExpirationPasseport: optionalDate,
  statut: z.enum(["ACTIF", "INACTIF"]),
  observations: optionalText(1000),
}).superRefine((values, context) => {
  if (requiresOtherTypePrecision(values.idTypeAutreActeur, values.observations)) context.addIssue({ code: "custom", path: ["observations"], message: "Précisez la nature de l’acteur dans les observations." })
  if (values.dateDelivrancePasseport && values.dateExpirationPasseport && compareDateValues(values.dateDelivrancePasseport, values.dateExpirationPasseport)! > 0) context.addIssue({ code: "custom", path: ["dateExpirationPasseport"], message: "La date d’expiration ne peut pas précéder la délivrance." })
})

export type AutreActeurFormValues = z.input<typeof autreActeurFormSchema>
