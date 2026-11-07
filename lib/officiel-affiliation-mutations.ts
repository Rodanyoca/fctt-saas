import "server-only"
import { getOfficialActorType, getOfficialFunctions, getSeasons, getStructureTypes } from "@/lib/actor-references"
import { compareDateValues, formatDateForSheet } from "@/lib/compact-date"
import { getClubs, getEntentes, getLigues, getOfficiels } from "@/lib/data"
import { env } from "@/lib/env"
import { appendSheetRecord, formatSheetDateColumn } from "@/lib/google-sheets"
import { getOfficielAffiliations } from "@/lib/actor-records"
const text=(v:unknown)=>String(v??"").trim()
const nextId=(ids:string[])=>`MAN${String(ids.reduce((m,id)=>Math.max(m,Number(id.match(/(\d+)$/)?.[1]??0)),0)+1).padStart(6,"0")}`
export async function createOfficielAffiliation(idOfficiel:string,p:Record<string,unknown>){
 const idFonction=text(p.idFonction),idTypeStructure=text(p.idTypeStructure),idStructure=text(p.idStructure),idSaison=text(p.idSaison),dateDebut=text(p.dateDebut),dateFin=text(p.dateFin),statut=text(p.statutMandat).toUpperCase()||"ACTIF",observations=text(p.observations)
 if(!idFonction||!idTypeStructure||!idStructure||!idSaison||!dateDebut)throw new Error("La fonction, la structure, la saison et la date de début sont obligatoires.")
 try{formatDateForSheet(dateDebut);if(dateFin)formatDateForSheet(dateFin)}catch{throw new Error("Les dates du mandat sont invalides.")}
 if(dateFin&&compareDateValues(dateDebut,dateFin)!>0)throw new Error("La date de fin doit être postérieure à la date de début.")
 if(!new Set(["ACTIF","INACTIF","EN ATTENTE"]).has(statut))throw new Error("Le statut du mandat est invalide.")
 const [officiels,functions,types,seasons,actorType,ligues,ententes,clubs,mandats]=await Promise.all([getOfficiels(),getOfficialFunctions(),getStructureTypes(),getSeasons(),getOfficialActorType(),getLigues(),getEntentes(),getClubs(),getOfficielAffiliations()])
 const officiel=officiels.find(o=>o.idOfficiel===idOfficiel);if(!officiel)throw new Error("Officiel introuvable.")
 if(!actorType)throw new Error("Le type d’acteur OFFICIEL est absent du référentiel.")
 if(!functions.some(x=>x.id===idFonction)||!types.some(x=>x.id===idTypeStructure)||!seasons.some(x=>x.id===idSaison))throw new Error("Une valeur de référentiel sélectionnée est invalide.")
 const type=types.find(x=>x.id===idTypeStructure)!, pool=type.nom==="LIGUE"?ligues.map(x=>({id:x.idLigue,nom:x.nomLigue})):type.nom==="ENTENTE"?ententes.map(x=>({id:x.idEntente,nom:x.nomEntente})):type.nom==="CLUB"?clubs.map(x=>({id:x.idClub,nom:x.nomClub})):[]
 const structure=pool.find(x=>x.id===idStructure);if(!structure)throw new Error("La structure sélectionnée est invalide.")
 const idMandat=nextId(mandats.map(x=>x.idAffiliation));await Promise.all([formatSheetDateColumn(env.googleSheets.affiliationsSpreadsheetId,"MANDATS","date_debut","yyyy-mm-dd"),formatSheetDateColumn(env.googleSheets.affiliationsSpreadsheetId,"MANDATS","date_fin","yyyy-mm-dd")])
 await appendSheetRecord(env.googleSheets.affiliationsSpreadsheetId,"MANDATS",{id_mandat:idMandat,id_acteur:idOfficiel,id_type_acteur:actorType.id,id_fonction:idFonction,id_type_structure:idTypeStructure,id_structure:idStructure,id_saison:idSaison,date_debut:formatDateForSheet(dateDebut),date_fin:dateFin?formatDateForSheet(dateFin):"",statut_mandat:statut,observations},"OVERWRITE")
 return {deactivatedAffiliationId:"",affiliation:{idAffiliation:idMandat,actorId:idOfficiel,actorName:officiel.nomComplet,idTypeActeur:actorType.id,idFonction,idTypeStructure,idStructure,idSaison,typeStructure:type.nom,saison:seasons.find(x=>x.id===idSaison)?.nom??"",fonction:functions.find(x=>x.id===idFonction)?.nom??"",nomStructure:structure.nom,dateDebut:formatDateForSheet(dateDebut),dateFin:dateFin?formatDateForSheet(dateFin):"",statutAffiliation:statut,observation:observations}}
}
