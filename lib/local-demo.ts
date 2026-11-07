import type { SheetRow } from "./google-sheets"
/** Entirely fictional local examples. Unknown reference lists remain empty. */
const sheets: Record<string, SheetRow[]> = {
  "PROVINCES": [
    {
      "id_province": "DEMO-P1",
      "nom_province": "Province de démonstration"
    }
  ],
  "VILLES": [
    {
      "id_ville": "DEMO-V1",
      "nom_ville": "Ville de démonstration"
    }
  ],
  "LIGUES": [
    {
      "id_ligue": "DEMO-L1",
      "nom_ligue": "Ligue de démonstration 1",
      "sigle_ligue": "LD1",
      "id_province": "DEMO-P1",
      "statut": "ACTIF",
      "annee_creation": "2020",
      "date_affiliation_ligue": "2025-01-10",
      "observations": "Fiche fictive locale, sans valeur administrative."
    },
    {
      "id_ligue": "DEMO-L2",
      "nom_ligue": "Ligue de démonstration 2",
      "sigle_ligue": "LD2",
      "id_province": "DEMO-P1",
      "statut": "ACTIF",
      "annee_creation": "2020",
      "date_affiliation_ligue": "2025-01-10",
      "observations": "Fiche fictive locale, sans valeur administrative."
    },
    {
      "id_ligue": "DEMO-L3",
      "nom_ligue": "Ligue de démonstration 3",
      "sigle_ligue": "LD3",
      "id_province": "DEMO-P1",
      "statut": "ACTIF",
      "annee_creation": "2020",
      "date_affiliation_ligue": "2025-01-10",
      "observations": "Fiche fictive locale, sans valeur administrative."
    }
  ],
  "ENTENTES": [
    {
      "id_entente": "DEMO-E1",
      "nom_entente": "Entente de démonstration 1",
      "sigle_entente": "ED1",
      "id_ligue": "DEMO-L1",
      "id_ville": "DEMO-V1",
      "statut": "ACTIF",
      "date_creation": "2020-02-01"
    },
    {
      "id_entente": "DEMO-E2",
      "nom_entente": "Entente de démonstration 2",
      "sigle_entente": "ED2",
      "id_ligue": "DEMO-L2",
      "id_ville": "DEMO-V1",
      "statut": "ACTIF",
      "date_creation": "2020-02-01"
    },
    {
      "id_entente": "DEMO-E3",
      "nom_entente": "Entente de démonstration 3",
      "sigle_entente": "ED3",
      "id_ligue": "DEMO-L3",
      "id_ville": "DEMO-V1",
      "statut": "ACTIF",
      "date_creation": "2020-02-01"
    }
  ],
  "CLUBS": [
    {
      "id_club": "DEMO-C1",
      "nom_club": "Club de démonstration 1",
      "sigle_club": "CD1",
      "id_entente": "DEMO-E1",
      "id_ville": "DEMO-V1",
      "statut": "ACTIF",
      "date_affiliation": "2025-01-10",
      "date_creation": "2021-01-01"
    },
    {
      "id_club": "DEMO-C2",
      "nom_club": "Club de démonstration 2",
      "sigle_club": "CD2",
      "id_entente": "DEMO-E2",
      "id_ville": "DEMO-V1",
      "statut": "ACTIF",
      "date_affiliation": "2025-01-10",
      "date_creation": "2021-01-01"
    },
    {
      "id_club": "DEMO-C3",
      "nom_club": "Club de démonstration 3",
      "sigle_club": "CD3",
      "id_entente": "DEMO-E3",
      "id_ville": "DEMO-V1",
      "statut": "ACTIF",
      "date_affiliation": "2025-01-10",
      "date_creation": "2021-01-01"
    }
  ],
  "ATHLETES": [
    {
      "id_athlete": "DEMO-ATHLETES-1",
      "nom_complet": "Athlète de démonstration 1",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C1",
      "nom_club": "Club de démonstration 1",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    },
    {
      "id_athlete": "DEMO-ATHLETES-2",
      "nom_complet": "Athlète de démonstration 2",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C2",
      "nom_club": "Club de démonstration 2",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    },
    {
      "id_athlete": "DEMO-ATHLETES-3",
      "nom_complet": "Athlète de démonstration 3",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C3",
      "nom_club": "Club de démonstration 3",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    }
  ],
  "COACHS": [
    {
      "id_coach": "DEMO-COACHS-1",
      "nom_complet": "Entraîneur de démonstration 1",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C1",
      "nom_club": "Club de démonstration 1",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    },
    {
      "id_coach": "DEMO-COACHS-2",
      "nom_complet": "Entraîneur de démonstration 2",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C2",
      "nom_club": "Club de démonstration 2",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    },
    {
      "id_coach": "DEMO-COACHS-3",
      "nom_complet": "Entraîneur de démonstration 3",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C3",
      "nom_club": "Club de démonstration 3",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    }
  ],
  "ARBITRES": [
    {
      "id_arbitre": "DEMO-ARBITRES-1",
      "nom_complet": "Arbitre de démonstration 1",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C1",
      "nom_club": "Club de démonstration 1",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    },
    {
      "id_arbitre": "DEMO-ARBITRES-2",
      "nom_complet": "Arbitre de démonstration 2",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C2",
      "nom_club": "Club de démonstration 2",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    },
    {
      "id_arbitre": "DEMO-ARBITRES-3",
      "nom_complet": "Arbitre de démonstration 3",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C3",
      "nom_club": "Club de démonstration 3",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    }
  ],
  "MEDECINS": [
    {
      "id_medecin": "DEMO-MEDECINS-1",
      "nom_complet": "Médecin de démonstration 1",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C1",
      "nom_club": "Club de démonstration 1",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    },
    {
      "id_medecin": "DEMO-MEDECINS-2",
      "nom_complet": "Médecin de démonstration 2",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C2",
      "nom_club": "Club de démonstration 2",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    },
    {
      "id_medecin": "DEMO-MEDECINS-3",
      "nom_complet": "Médecin de démonstration 3",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C3",
      "nom_club": "Club de démonstration 3",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    }
  ],
  "OFFICIELS": [
    {
      "id_officiel": "DEMO-OFFICIELS-1",
      "nom_complet": "Officiel de démonstration 1",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C1",
      "nom_club": "Club de démonstration 1",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    },
    {
      "id_officiel": "DEMO-OFFICIELS-2",
      "nom_complet": "Officiel de démonstration 2",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C2",
      "nom_club": "Club de démonstration 2",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    },
    {
      "id_officiel": "DEMO-OFFICIELS-3",
      "nom_complet": "Officiel de démonstration 3",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C3",
      "nom_club": "Club de démonstration 3",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    }
  ],
  "AUTRES": [
    {
      "id_autre_acteur": "DEMO-AUTRES-1",
      "nom_complet": "Autre acteur de démonstration 1",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C1",
      "nom_club": "Club de démonstration 1",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    },
    {
      "id_autre_acteur": "DEMO-AUTRES-2",
      "nom_complet": "Autre acteur de démonstration 2",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C2",
      "nom_club": "Club de démonstration 2",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    },
    {
      "id_autre_acteur": "DEMO-AUTRES-3",
      "nom_complet": "Autre acteur de démonstration 3",
      "id_sexe": "DEMO-S1",
      "date_de_naissance": "2000-06-15",
      "date_naissance": "2000-06-15",
      "statut": "ACTIF",
      "id_club": "DEMO-C3",
      "nom_club": "Club de démonstration 3",
      "id_type_autre_acteur": "DEMO-AUT",
      "observations": "Personne entièrement fictive."
    }
  ],
  "ATHLETE_AFFILIATIONS": [
    {
      "id_affiliation": "DEMO-AFF1",
      "id_athlete": "DEMO-ATHLETES-1",
      "nom_complet": "Athlète de démonstration 1",
      "id_club": "DEMO-C1",
      "id_club_beneficiaire": "DEMO-C1",
      "nom_club": "Club de démonstration 1",
      "nom_club_beneficiaire": "Club de démonstration 1",
      "date_debut": "2025-01-10",
      "statut_affiliation": "ACTIF",
      "saison": "Saison de démonstration",
      "id_affiliation_athlete": "DEMO-AFF1"
    },
    {
      "id_affiliation": "DEMO-AFF2",
      "id_athlete": "DEMO-ATHLETES-2",
      "nom_complet": "Athlète de démonstration 2",
      "id_club": "DEMO-C2",
      "id_club_beneficiaire": "DEMO-C2",
      "nom_club": "Club de démonstration 2",
      "nom_club_beneficiaire": "Club de démonstration 2",
      "date_debut": "2025-01-10",
      "statut_affiliation": "ACTIF",
      "saison": "Saison de démonstration",
      "id_affiliation_athlete": "DEMO-AFF2"
    },
    {
      "id_affiliation": "DEMO-AFF3",
      "id_athlete": "DEMO-ATHLETES-3",
      "nom_complet": "Athlète de démonstration 3",
      "id_club": "DEMO-C3",
      "id_club_beneficiaire": "DEMO-C3",
      "nom_club": "Club de démonstration 3",
      "nom_club_beneficiaire": "Club de démonstration 3",
      "date_debut": "2025-01-10",
      "statut_affiliation": "ACTIF",
      "saison": "Saison de démonstration",
      "id_affiliation_athlete": "DEMO-AFF3"
    },
    {
      "id_affiliation": "DEMO-AFF-HIST",
      "id_athlete": "DEMO-ATHLETES-1",
      "id_club": "DEMO-C2",
      "nom_club": "Club de démonstration 2",
      "date_debut": "2023-01-01",
      "date_fin": "2024-12-31",
      "statut_affiliation": "INACTIF",
      "id_affiliation_athlete": "DEMO-AFF-HIST"
    }
  ],
  "SEXES": [
    {
      "id_sexe": "DEMO-S1",
      "nom_sexe": "Masculin"
    },
    {
      "id_sexe": "DEMO-S2",
      "nom_sexe": "Féminin"
    }
  ],
  "TYPES_AUTRES_ACTEURS": [
    {
      "id_type_autre_acteur": "DEMO-AUT",
      "nom_type_autre_acteur": "Type de démonstration",
      "statut": "ACTIF"
    }
  ],
  "TYPES_COMPETITIONS": [
    {
      "id_type_competition": "DEMO-TYPES_COMPETITIONS",
      "nom_type_competition": "Type de démonstration",
      "statut": "ACTIF"
    }
  ],
  "TYPES_ACTIVITE": [
    {
      "id_type_activite": "DEMO-TYPES_ACTIVITE",
      "nom_type_activite": "Type de démonstration",
      "statut": "ACTIF"
    }
  ],
  "TYPES_DOCUMENT": [
    {
      "id_type_document": "DEMO-TYPES_DOCUMENT",
      "nom_type_document": "Type de démonstration",
      "statut": "ACTIF"
    }
  ],
  "SAISON": [
    {
      "id_saison": "DEMO-SAISON",
      "nom_saison": "Saison de démonstration",
      "date_debut": "2026-01-01",
      "date_fin": "2026-12-31"
    }
  ],
  "PARAMETRES_SYSTEME": [
    {
      "cle_parametre": "SAISON_COURANTE",
      "valeur_parametre": "DEMO-SAISON"
    }
  ],
  "COMPETITIONS": [
    {
      "id_competition": "DEMO-COMP-1",
      "numero_edition": "1",
      "nom_competition": "Compétition de démonstration 1",
      "id_type_competition": "DEMO-TYPES_COMPETITIONS",
      "id_saison": "DEMO-SAISON",
      "date_debut": "2026-10-10",
      "date_fin": "2026-10-11",
      "pays": "RDC",
      "lieu": "Site de démonstration",
      "statut": "PLANIFIEE",
      "observations": "Disciplines et règlement athlétisme à valider."
    },
    {
      "id_competition": "DEMO-COMP-2",
      "numero_edition": "1",
      "nom_competition": "Compétition de démonstration 2",
      "id_type_competition": "DEMO-TYPES_COMPETITIONS",
      "id_saison": "DEMO-SAISON",
      "date_debut": "2026-10-10",
      "date_fin": "2026-10-11",
      "pays": "RDC",
      "lieu": "Site de démonstration",
      "statut": "PLANIFIEE",
      "observations": "Disciplines et règlement athlétisme à valider."
    },
    {
      "id_competition": "DEMO-COMP-3",
      "numero_edition": "1",
      "nom_competition": "Compétition de démonstration 3",
      "id_type_competition": "DEMO-TYPES_COMPETITIONS",
      "id_saison": "DEMO-SAISON",
      "date_debut": "2026-10-10",
      "date_fin": "2026-10-11",
      "pays": "RDC",
      "lieu": "Site de démonstration",
      "statut": "PLANIFIEE",
      "observations": "Disciplines et règlement athlétisme à valider."
    }
  ],
  "ACTIVITES": [
    {
      "id_activite": "DEMO-ACT-1",
      "id_type_activite": "DEMO-TYPES_ACTIVITE",
      "nom_activite": "Activité de démonstration 1",
      "titre_public": "Activité de démonstration 1",
      "date_debut": "2026-10-15",
      "date_fin": "2026-10-15",
      "pays": "RDC",
      "lieu": "Site de démonstration",
      "statut": "PLANIFIEE"
    },
    {
      "id_activite": "DEMO-ACT-2",
      "id_type_activite": "DEMO-TYPES_ACTIVITE",
      "nom_activite": "Activité de démonstration 2",
      "titre_public": "Activité de démonstration 2",
      "date_debut": "2026-10-15",
      "date_fin": "2026-10-15",
      "pays": "RDC",
      "lieu": "Site de démonstration",
      "statut": "PLANIFIEE"
    },
    {
      "id_activite": "DEMO-ACT-3",
      "id_type_activite": "DEMO-TYPES_ACTIVITE",
      "nom_activite": "Activité de démonstration 3",
      "titre_public": "Activité de démonstration 3",
      "date_debut": "2026-10-15",
      "date_fin": "2026-10-15",
      "pays": "RDC",
      "lieu": "Site de démonstration",
      "statut": "PLANIFIEE"
    }
  ],
  "DOCUMENTS": [
    {
      "id_document": "DEMO-DOC-1",
      "id_type_document": "DEMO-TYPES_DOCUMENT",
      "titre_document": "Document de démonstration 1",
      "date_document": "2026-10-02",
      "statut": "ACTIF",
      "description": "Exemple local, aucun fichier chargé sur Drive."
    },
    {
      "id_document": "DEMO-DOC-2",
      "id_type_document": "DEMO-TYPES_DOCUMENT",
      "titre_document": "Document de démonstration 2",
      "date_document": "2026-10-02",
      "statut": "ACTIF",
      "description": "Exemple local, aucun fichier chargé sur Drive."
    },
    {
      "id_document": "DEMO-DOC-3",
      "id_type_document": "DEMO-TYPES_DOCUMENT",
      "titre_document": "Document de démonstration 3",
      "date_document": "2026-10-02",
      "statut": "ACTIF",
      "description": "Exemple local, aucun fichier chargé sur Drive."
    }
  ],
  "DOCUMENTS_RELATIONS": [
    {
      "id_relation_document": "DEMO-REL1",
      "id_document": "DEMO-DOC-1",
      "id_type_entite": "CLUB",
      "id_entite": "DEMO-C1",
      "type_relation": "CONCERNE"
    }
  ],
  "EQUIPE_NATIONALE": [
    {
      "id_equipe_nationale": "DEMO-EN1",
      "nom_equipe_nationale": "Sélection nationale de démonstration",
      "discipline": "Athlétisme",
      "categorie": "",
      "genre": "",
      "saison": "Saison de démonstration",
      "statut_equipe": "ACTIF",
      "observation": "Équipe permanente fictive; activation et campagnes à valider."
    }
  ],
  "STATUT_LICENCE": [
    {
      "id_statut_licence": "DEMO-ST",
      "nom_statut_licence": "Statut de démonstration"
    }
  ],
  "ATHLETE_LICENCES": [
    {
      "id_licence": "DEMO-LIC-1",
      "numero_licence": "DEMO-1",
      "id_athlete": "DEMO-ATHLETES-1",
      "id_affiliation_athlete": "DEMO-AFF1",
      "id_club": "DEMO-C1",
      "id_saison": "DEMO-SAISON",
      "date_delivrance": "2026-01-01",
      "id_statut_licence": "DEMO-ST"
    },
    {
      "id_licence": "DEMO-LIC-2",
      "numero_licence": "DEMO-2",
      "id_athlete": "DEMO-ATHLETES-2",
      "id_affiliation_athlete": "DEMO-AFF2",
      "id_club": "DEMO-C2",
      "id_saison": "DEMO-SAISON",
      "date_delivrance": "2026-01-01",
      "id_statut_licence": "DEMO-ST"
    },
    {
      "id_licence": "DEMO-LIC-3",
      "numero_licence": "DEMO-3",
      "id_athlete": "DEMO-ATHLETES-3",
      "id_affiliation_athlete": "DEMO-AFF3",
      "id_club": "DEMO-C3",
      "id_saison": "DEMO-SAISON",
      "date_delivrance": "2026-01-01",
      "id_statut_licence": "DEMO-ST"
    }
  ],
  "ACTEURS_LICENCES": [
    {
      "id_licence": "DEMO-LIC-COACH-1",
      "numero_licence": "DEMO-COACH-1",
      "id_type_acteur": "TAC002",
      "id_acteur": "DEMO-COACHS-1",
      "date_delivrance": "2026-01-01",
      "id_statut_licence": "DEMO-ST"
    },
    {
      "id_licence": "DEMO-LIC-COACH-2",
      "numero_licence": "DEMO-COACH-2",
      "id_type_acteur": "TAC002",
      "id_acteur": "DEMO-COACHS-2",
      "date_delivrance": "2026-01-01",
      "id_statut_licence": "DEMO-ST"
    },
    {
      "id_licence": "DEMO-LIC-COACH-3",
      "numero_licence": "DEMO-COACH-3",
      "id_type_acteur": "TAC002",
      "id_acteur": "DEMO-COACHS-3",
      "date_delivrance": "2026-01-01",
      "id_statut_licence": "DEMO-ST"
    }
  ],
  "TYPES_ACTEURS": [
    {
      "id_type_acteur": "TAC001",
      "nom_type_acteur": "Athlète",
      "source_donnees": "ATHLETES"
    },
    {
      "id_type_acteur": "TAC002",
      "nom_type_acteur": "Entraîneur",
      "source_donnees": "COACHS"
    },
    {
      "id_type_acteur": "TAC003",
      "nom_type_acteur": "Officiel",
      "source_donnees": "OFFICIELS"
    },
    {
      "id_type_acteur": "TAC004",
      "nom_type_acteur": "Arbitre",
      "source_donnees": "ARBITRES"
    },
    {
      "id_type_acteur": "TAC005",
      "nom_type_acteur": "Médecin",
      "source_donnees": "MEDECINS"
    }
  ]
}
export function readDemoSheet(range: string): SheetRow[] { const name = range.split("!")[0].replaceAll("\"", "").replaceAll("'", ""); return structuredClone(sheets[name] ?? []) }
