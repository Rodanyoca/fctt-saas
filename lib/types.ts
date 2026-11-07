export type Statut = string

export interface Province {
  idProvince: string
  nomProvince: string
  id: string
  nom: string
  chefLieu: string
  responsable: string
  telephone: string
  email: string
  statut: "active" | "inactive" | string

  ligues: number
  ententes: number
  clubs: number
  athletes: number
  coachs: number
  arbitres: number
  medecins: number
  completude: number
}

export interface Ligue {
  idLigue: string
  nomLigue: string
  idProvince: string
  nomProvince: string
  observations: string
  id: string
  nom: string
  provinceId: string
  provinceNom: string
  emailLigue: string
  sigleLigue?: string
  telephone?: string
  idLigueCoc?: string
  anneeCreation?: string
  dateAffiliation?: string
  presidentId: string
  presidentNom: string
  presidentTelephone: string
  presidentEmail: string
  secretaireId: string
  secretaireNom: string
  secretaireTelephone: string
  secretaireEmail: string
  statut: Statut

  // Optional legacy/display fields (if present in the sheet)
  ententes?: number
  clubs?: number
  athletes?: number
}

export interface Entente {
  idEntente: string
  codeEntente: string
  nomEntente: string
  pseudoEntente: string
  idLigue: string
  nomLigue: string
  emailEntente: string
  sigleEntente?: string
  idVille?: string
  ville?: string
  telephone?: string
  idEntenteCoc?: string
  dateCreation?: string
  dateReconnaissance?: string
  observations: string
  id: string
  numeroOrdre: string
  nom: string
  pseudo: string
  ligueId: string
  ligueNom: string
  provinceId: string
  provinceNom: string
  statut: Statut

  // Optional computed/legacy fields (not present in the ENTENTES sheet today)
  clubs?: number
  athletes?: number
}

export interface Club {
  idClub: string
  codeClub: string
  nomClub: string
  dateAffiliationClub: string
  idEntente: string
  nomEntente: string
  idLigue: string
  nomLigue: string
  observations: string
  id: string
  numeroOrdre: string
  nom: string
  categorie: string
  idCategorieClub?: string
  idSexe?: string
  idVille?: string
  ville?: string
  idLigueHistorique?: string
  idNiveauCompetitifClub?: string
  idClubCoc?: string
  sigleClub?: string
  dateCreation?: string
  telephone?: string
  email?: string
  logoDriveId?: string
  logoDriveUrl?: string
  provinceId: string
  provinceNom: string
  ligueId: string
  ligueNom: string
  ententeId: string
  ententeNom: string
  pseudoEntente: string
  version: string
  dateAffiliation: string
  personneContactNom: string
  personneContactTelephone: string
  presidentId: string
  presidentNom: string
  presidentTelephone: string
  presidentEmail: string
  adresse: string
  statut: Statut

  // Optional computed fields
  athletes?: number
}

export interface Athlete {
  idAthlete: string
  idNational: string
  idFivb: string
  idSexe: string
  dateDeNaissance: string
  sexe: string
  avatarDriveId: string
  avatarDriveUrl: string
  id: string
  numeroOrdre: string
  nomComplet: string
  dateNaissance: string
  lieuNaissance: string
  genre: string
  nationalite: string
  adresse: string
  provinceId: string
  provinceNom: string
  ligueId: string
  ligueNom: string
  ententeId: string
  ententeNom: string
  clubId: string
  clubNom: string
  disciplineActive: string
  posteIndoor: string
  posteBeach: string
  numero: string
  taille: number | null
  poids: number | null
  telephone: string
  email: string
  observations: string
  statut: Statut
}

export interface Coach {
  idCoach: string
  idNational: string
  idFivb: string
  idSexe: string
  sexe: string
  avatarDriveId: string
  avatarDriveUrl: string
  id: string
  nomComplet: string
  dateNaissance: string
  lieuNaissance: string
  genre: string
  nationalite: string
  telephone: string
  email: string
  adresse: string
  idNiveau: string
  niveau: string
  specialisation: string
  dateAffiliation: string
  statut: Statut
}

export interface BaseActorAffiliation {
  idAffiliation: string
  actorId: string
  actorName: string
  idStructure: string
  nomStructure: string
  dateDebut: string
  dateFin: string
  statutAffiliation: Statut
  observation: string
}

export interface AthleteAffiliation extends BaseActorAffiliation {
  saison: string
  typeAffiliation: string
  idClubOrigine: string
  nomClubOrigine: string
  idClubBeneficiaire: string
  nomClubBeneficiaire: string
}

export interface CoachAffiliation extends BaseActorAffiliation {
  saison: string
  typeAffiliation: string
  fonction: string
}

export interface MedecinAffiliation extends BaseActorAffiliation {
  saison: string
  typeAffiliation: string
  fonction: string
}

export interface OfficielAffiliation extends BaseActorAffiliation {
  idTypeActeur: string
  idFonction: string
  idTypeStructure: string
  idSaison: string
  typeStructure: string
  saison: string
  fonction: string
}

export interface BaseActorLicence {
  idLicence: string
  numeroLicence: string
  actorId: string
  actorName: string
  dateDelivrance: string
  dateDebutValidite?: string
  dateFinValidite: string
  statutLicence: Statut
  idStatutLicence?: string
  idCycleLicence?: string
  idAffiliationActeur?: string
  idLicencePrecedente: string
  numeroLicencePrecedente: string
}

export interface AthleteLicence extends BaseActorLicence {
  saison: string
  idAffiliation: string
  idClub: string
  nomClub: string
}

export interface Officiel {
  idOfficiel: string
  idSexe: string
  idNational: string
  idFivb: string
  sexe: string
  dateDeNaissance: string
  nationalite: string
  avatarDriveId: string
  avatarDriveUrl: string
  id: string
  nomComplet: string
  dateNaissance: string
  genre: string
  telephone: string
  email: string
  adresse: string
  lieuNaissance: string
  numeroPasseport: string
  dateDelivrancePasseport: string
  dateExpirationPasseport: string
  observations: string
  passeportDriveId: string
  passeportDriveUrl: string
  fonction: string
  entite: string
  rattachement: string
  dateNomination: string
  dateFinMandat: string
  equipeFederal: string
  statut: Statut
}

export interface TypeAutreActeur {
  id: string
  nom: string
  observations: string
  statut: Statut
}

export interface AutreActeur {
  idAutreActeur: string
  nomComplet: string
  idSexe: string
  sexe: string
  dateNaissance: string
  lieuNaissance: string
  nationalite: string
  idTypeAutreActeur: string
  typeAutreActeur: string
  telephone: string
  email: string
  adresse: string
  numeroPasseport: string
  dateDelivrancePasseport: string
  dateExpirationPasseport: string
  statut: Statut
  observations: string
  avatarDriveId: string
  avatarDriveUrl: string
  passeportDriveId: string
  passeportDriveUrl: string
  id: string
}

export interface Medecin {
  idMedecin: string
  idSexe: string
  idSpecialite: string
  idNational: string
  idFivb: string
  sexe: string
  dateDeNaissance: string
  nationalite: string
  avatarDriveId: string
  avatarDriveUrl: string
  id: string
  nomComplet: string
  dateNaissance: string
  genre: string
  specialite: string
  niveau: string
  telephone: string
  email: string
  adresse: string
  lieuNaissance?: string
  numeroPasseport: string
  dateDelivrancePasseport: string
  dateExpirationPasseport: string
  observations?: string
  passeportDriveId: string
  passeportDriveUrl: string
  numeroOrdre: string
  equipeNationale: string
  provinceId: string
  provinceNom: string
  ligueId: string
  ligueNom: string
  ententeId: string
  ententeNom: string
  pseudoEntente: string
  clubId: string
  clubNom: string
  equipeId: string
  equipeNom: string
  dateAffiliation: string
  statut: Statut
  affiliations: MedecinAffiliation[]
}

export interface Arbitre {
  idArbitre: string
  idSexe: string
  idGrade: string
  idNational: string
  idFivb: string
  sexe: string
  dateDeNaissance: string
  nationalite: string
  niveau: string
  avatarDriveId: string
  avatarDriveUrl: string
  id: string
  nomComplet: string
  dateNaissance: string
  genre: string
  grade: string
  provinceId: string
  provinceNom: string
  ligueId: string
  ligueNom: string
  ententeId: string
  ententeNom: string
  telephone: string
  email: string
  adresse: string
  dateAffiliation: string
  dateHomologation: string
  equipeNational: string
  experience: string
  statut: Statut
}

export type CompetitionDiscipline = "INDOOR" | "BEACH" | string

export interface Competition {
  idCompetition: string
  nomCompetition: string
  typeCompetition: string
  formatCompetition: string
  idDiscipline: string
  nomDiscipline: string
  saison: string
  dateDebut: string
  dateFin: string
  lieu: string
  niveau: string
  statutCompetition: Statut
  idStructureOrganisatrice: string
  nomStructureOrganisatrice: string
  observation: string
}

export interface CompetitionParticipant {
  idParticipation: string
  idCompetition: string
  nomCompetition: string
  discipline: CompetitionDiscipline
  saison: string
  idUnite: string
  nomUnite: string
  idAthlete: string
  nomAthlete: string
  sexe: string
  idPoste: string
  nomPoste: string
  nomClub: string
  statutParticipation: string
  numeroMaillot: string
  observation: string
  typeParticipant?: string
  idClub?: string
  poule?: string
  exportCoc?: string
}

export interface CompetitionUnite {
  idUnite: string
  idCompetition: string
  nomCompetition: string
  discipline: CompetitionDiscipline
  saison: string
  typeUnite: string
  idClub: string
  nomClub: string
  version: string
  idAthleteA: string
  nomAthleteA: string
  idAthleteB: string
  nomAthleteB: string
  nomUnite: string
  poule: string
  statutUnite: string
  observation: string
}

export interface CompetitionResult {
  idResultat: string
  idCompetition: string
  nomCompetition: string
  discipline: CompetitionDiscipline
  saison: string
  dateMatch: string
  heureMatch: string
  lieuMatch: string
  classementPoule: string
  phase: string
  poule: string
  idUniteA: string
  nomUniteA: string
  idUniteB: string
  nomUniteB: string
  scoreGlobal: string
  set1A: number | null
  set1B: number | null
  set2A: number | null
  set2B: number | null
  set3A: number | null
  set3B: number | null
  set4A: number | null
  set4B: number | null
  set5A: number | null
  set5B: number | null
  setsGagnesA: number | null
  setsGagnesB: number | null
  totalPointA: number | null
  totalPointB: number | null
  pointsClassementA: number | null
  pointsClassementB: number | null
  idUniteVainqueur: string
  nomUniteVainqueur: string
  forfait: string
  vainqueur: string
  statutMatch: string
  observation: string
}

export interface CompetitionClassement {
  idClassement: string
  coteUnite: string
  idResultat: string
  idCompetition: string
  nomCompetition: string
  discipline: CompetitionDiscipline
  saison: string
  phase: string
  poule: string
  idUnite: string
  nomUnite: string
  idAdversaire: string
  nomAdversaire: string
  scoreGlobal: string
  resultatMatch: string
  setsGagnes: number | null
  setsPerdus: number | null
  pointsGagnes: number | null
  pointsPerdus: number | null
  pointsClassement: number | null
  matchsJoues: number
  matchsGagnes: number
  matchsPerdus: number
  pointsMarques: number
  pointsEncaisses: number
  ratioSets: number
  ratioPoints: number
  matchJoue: number | null
  matchGagne: number | null
  matchPerdu: number | null
  rang: number | null
  observation: string
  typeUnite?: string
  adversaire?: string
  differenceSets?: number | null
  differencePoints?: number | null
}

export interface Transfert {
  id: string
  athleteId: string
  athleteNom: string
  clubOrigineId: string
  clubOrigineNom: string
  clubBeneficiaireId: string
  clubBeneficiaireNom: string
  typeTransfert: string
  saison: string
  statut: Statut
  dateValidation: string
  dateDebut: string
  dateFin: string
  observation: string
}

export interface EquipeNationale {
  idEquipeNationale: string
  nomEquipeNationale: string
  discipline: string
  categorie: string
  genre: string
  saison: string
  statutEquipe: Statut
  observation: string
}

export interface EquipeNationaleSelection {
  idSelection: string
  idEquipeNationale: string
  nomEquipeNationale: string
  discipline: string
  categorie: string
  genre: string
  idAthlete: string
  nomAthlete: string
  idClub: string
  nomClub: string
  poste: string
  idPoste: string
  nomPoste: string
  numeroMaillot: string
  capitaine: string
  saison: string
  dateDebutSelection: string
  dateFinSelection: string
  statutSelection: Statut
  observation: string
}

export interface EquipeNationaleStaff {
  idStaffSelection: string
  idEquipeNationale: string
  nomEquipeNationale: string
  discipline: string
  categorie: string
  genre: string
  typeActeur: string
  idActeur: string
  nomActeur: string
  fonction: string
  saison: string
  dateDebut: string
  dateFin: string
  statutStaff: string
  observation: string
}

export interface EquipeNationaleCompetition {
  idParticipationEquipeNationale: string
  idParticipationEn: string
  idEquipeNationale: string
  nomEquipeNationale: string
  discipline: string
  categorie: string
  genre: string
  idCompetition: string
  nomCompetition: string
  niveauCompetition: string
  saison: string
  dateDebut: string
  dateFin: string
  lieu: string
  statutParticipation: Statut
  observation: string
}

export interface EquipeNationaleResultat {
  idResultatEquipeNationale: string
  idParticipationEquipeNationale: string
  idResultatEn: string
  idParticipationEn: string
  idEquipeNationale: string
  nomEquipeNationale: string
  discipline: string
  categorie: string
  genre: string
  idCompetition: string
  nomCompetition: string
  saison: string
  dateMatch: string
  phase: string
  poule: string
  adversaire: string
  paysAdversaire: string
  scoreGlobal: string
  set1Rdc: number | null
  set1Adv: number | null
  set1Adversaire: number | null
  set2Rdc: number | null
  set2Adv: number | null
  set2Adversaire: number | null
  set3Rdc: number | null
  set3Adv: number | null
  set3Adversaire: number | null
  set4Rdc: number | null
  set4Adv: number | null
  set4Adversaire: number | null
  set5Rdc: number | null
  set5Adv: number | null
  set5Adversaire: number | null
  setsGagnesRdc: number
  setsGagnesAdversaire: number
  totalPointsRdc: number
  totalPointsAdversaire: number
  totalPointRdc: number | null
  totalPointAdv: number | null
  resultatMatch: string
  statutMatch: string
  observation: string
}
