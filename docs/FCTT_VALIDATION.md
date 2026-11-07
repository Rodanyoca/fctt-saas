# FCTT - validation et point de reprise

## Sortie de build Vercel - 7 novembre 2026

Vercel attend le dossier Next standard `.next`. FCTT conserve son cache local isole `.next-fctt`, mais utilise `.next` lorsque `VERCEL=1` pour que la plateforme trouve la sortie du build.

## Premier point de contr?le : liste et fiche Joueur

?tat du 7 novembre 2026 : lecteur FCTT, liste et fiche param?tr?s ; tests simul?s r?ussis. L'utilisateur a demand? de renseigner les variables plus tard et de pr?parer .env.example. `.env.local` reste absent et n'a pas ?t? cr?? ou modifi?. La connexion SDK de l'application n'est donc pas valid?e et aucun test Google d?pendant de ces variables n'est ex?cut?.

### D?p?ts, ?tat initial et rapport d'?cart

| ?l?ment | Constat / traitement |
| --- | --- |
| Cible | Racine Git r?elle C:/Projets/SNDS-RDC/data/monosport/fctt-managment. Tous les fichiers applicatifs initialement non suivis, aucun remote configur?. Aucun reset, commit ou push. |
| R?f?rence principale | ../febadco-managment, racine Git v?rifi?e, origin Rodanyoca/febadco-saas. docs/FEBADCO_DEPLOIEMENT_404.md et vercel.json d?j? non suivis ; aucun fichier modifi?. |
| R?f?rence secondaire | ../fce-managment, racine Git v?rifi?e, origin Rodanyoca/fce-saas, ?tat propre ; aucun fichier modifi?. |
| Copie initiale | D?monstration FEACO/volleyball, faux services et IDs local-feaco, navigation territoriale/licences/?quipes. Lectures de d?monstration d?sactiv?es dans les anciens adaptateurs et anciennes API bloqu?es. |
| UI FEBADCO | Liste, filtres/pagination, panneau lat?ral G?n?ral -> Coordonn?es -> Affiliation, chargement ? la demande repris comme mod?le. Les libell?s Licence/BWF ne sont pas repris : ID f?d?ral permanent et ITTF. |
| P?rim?tre FCE | Quatre blocs, affiliation directe et r?sultats manuels retenus. Aucun territoire, transfert, historique d'affiliation, ?quipe nationale autonome ou registre de licences. |
| Connexions | Aucune .env.local ni liaison .vercel/vercel.json dans FCTT ; aucune cible Git h?rit?e pr?sente. L'?tat cloud Vercel n'a pas ?t? interrog?. Aucun outil Vercel ou d?ploiement. |
| Protections | Refus global des mutations conserv? ; acc?s aux donn?es r?elles limit? ? la boucle locale et aux autorit?s coh?rentes. Aucun module d'authentification ou d'utilisateurs ajout?. |

AGENTS.md et README ont ?t? adapt?s ? FCTT ; les anciennes matrices FEACO restent des archives et ne d?finissent plus le m?tier. Les changements pr?existants sont pr?serv?s. Cache Next isol? dans .next-fctt, d?marrage li? ? 127.0.0.1.

### Sources r?elles consult?es

Les lectures du connecteur Google Drive sont ind?pendantes des variables du serveur Next. M?tadonn?es lues avant les plages ; aucun changement de sch?ma ou ?criture de donn?es.

- 01_FCTT_ACTEURS : 16ygu-GXAzlzOa7O-F40ghq8NEQEAVqqG8hd9oSzIPuU.
- 00_FCTT_REFERENTIEL : 15YIULm6mASxqi7PPOA7HaxDr7N5fgpJ2FTu9zvnEhkU.
- ATHLETES : en-t?tes A1:AE1 puis IDs A1:A1000, 0 joueur. Aucune donn?e personnelle r?elle copi?e dans une fixture.
- SEXES, STATUTS_ACTEURS et FORMATS_ID : en-t?tes et lignes de r?f?rence lus. Capture publique d'en-t?tes/r?f?rences dans tests/fctt/source-headers.json, uniquement pour les tests.
- En-t?tes des cinq autres cat?gories lus pour pr?parer le mapping, sans lecture de leurs lignes personnelles. Les classeurs Comp?titions, Activit?s et Documents attendent leurs lots ; ils n'ont pas encore ?t? raccord?s.

ATHLETES poss?de : id_athlete, id_ittf, nom_complet, id_sexe, date_naissance, lieu_naissance, nationalite, telephone, email, adresse, numero_passeport, date_delivrance_passeport, date_expiration_passeport, date_affiliation, statut, avatar_drive_id, avatar_drive_url, passeport_drive_id, passeport_drive_url.

FORMATS_ID confirme ATHLETE TTB-ATH-###### (exemple TTB-ATH-000001), COACH TTB-COA-######, ARBITRE TTB-ARB-######, OFFICIEL TTB-OFF-######, MEDECIN TTB-MED-######, AUTRE_ACTEUR TTB-AUT-######. Identifiants permanents, distincts de toute r?gle de licence non confirm?e. Le lecteur signale une cl? absente/dupliqu?e/non conforme ; aucune cr?ation ou correction de cl? n'est effectu?e dans ce point de contr?le.

### Mapping route -> service -> feuille -> cl? -> champs

| Route | Service actif | Feuille / cl? | Champs ou r?ponse |
| --- | --- | --- | --- |
| /athletes | loadPlayers -> readFcttSheets | ATHLETES / id_athlete | id_athlete, nom_complet, id_ittf facultatif, id_sexe, nationalite, date_affiliation, statut. DTO : id, name, ittf, sex, nationality, affiliation, status. |
| GET /api/athletes | playerResponse -> loadPlayers -> readFcttSheets | M?me feuille / cl? | JSON {players}, sans coordonn?es, naissance, passeport, m?dias ou champ licence. |
| Fiche depuis /athletes, GET /api/athletes/[id] | playerResponse -> loadPlayer -> readFcttSheets | ATHLETES / id_athlete | Recherche de la ligne par ID avant enrichissement ; m?mes champs plus date_naissance, lieu_naissance, telephone, email, adresse, uniquement pour cette ligne. JSON {player}. |
| R?solution sexe | references / projection | SEXES / id_sexe | nom_sexe. |
| R?solution statut | references / projection | STATUTS_ACTEURS / id_statut_acteur | nom_statut_acteur ; statut vide conserv? et affich? Non renseign?. |
| Validation format | references / projection | FORMATS_ID / objet=ATHLETE | format_propose doit confirmer TTB-ATH-######. |
| /coachs, /arbitres, /officiels, /medecins, /autres-acteurs | PendingPage, aucun lecteur | En-t?tes r?els pr?par?s, pas de raccordement | ?tat explicite de pr?paration, aucune liste fictive. |
| /competitions, /activites, /documents | PendingPage, aucun lecteur | Lots ult?rieurs | ?tat explicite de pr?paration. |
| Anciennes routes Licences | PendingPage | Aucun classeur | Bient?t disponible ; API h?rit?es refus?es. Entr?e retir?e de la navigation. |

Sch?ma des cinq cat?gories suivantes, constat? mais non encore impl?ment? : COACHS=id_coach avec id_niveau ; ARBITRES=id_arbitre avec id_grade_arbitre ; OFFICIELS=id_officiel ; MEDECINS=id_medecin avec id_specialite ; chacune poss?de id_ittf et date_affiliation. AUTRES=id_autre_acteur, nom_complet, id_sexe, date_naissance, nationalite, telephone, email, id_federation, id_type_autre_acteur, statut, date_affiliation, observations ; aucune colonne id_ittf. Les r?f?rentiels de qualification sont ? relire au raccordement de ces cat?gories.

Les colonnes sont retrouv?es dans les en-t?tes par nom. Le lecteur construit ensuite des plages par colonne d?couverte : aucun index de champ fixe. La liste ne lit pas telephone/email/adresse/naissance/passeport. La fiche lit d'abord la seule colonne d'ID, conserve les num?ros r?els de ligne et demande uniquement les cellules autoris?es de la ligne choisie, avec relecture fra?che. Passeports, pi?ces d'identit? et m?dias ne sont jamais demand?s. Aucun id_bwf/id_fie/id_national dans le parcours actif ou ses DTO.

### Fonctionnement et fichiers du lot

- lib/fctt/config.ts : sept noms de variables serveur et cinq IDs FCTT autoris?s ; aucune valeur de repli ?trang?re. Seuls les blocs Acteurs/R?f?rentiel sont requis pour Joueurs.
- lib/fctt/players-domain.ts : projections, r?f?rentiels, unicit? et format des cl?s en lecture, fiche filtr?e avant enrichissement, erreurs typ?es configuration/connection/schema/not_found. Pas de mutation.
- lib/fctt/sheets-server.ts : import Sheets cibl?, scope readonly, batchGet, mutualisation et regroupement des lectures simultan?es, cache court 15 s des plages de liste/r?f?rences. Coordonn?es de fiche en lecture fra?che, sans cache persistant de donn?es sensibles. Erreurs SDK assainies.
- lib/fctt/api.ts et access.ts : DTO cibl?s, erreurs JSON sans d?tails Google, Cache-Control priv?/no-store, acc?s local.
- components/fctt/players-client.tsx : tableau/recherche/filtres/pagination, cartes mobiles, panneau lat?ral et requ?te de fiche ? la demande, chargement/erreur/reprise, fermeture ?chap avec recherche conserv?e. Date d'affiliation directement dans la fiche ; pas de club/saison/licence.
- components/dashboard/data-table.tsx : noms accessibles des filtres et boutons de pagination, retour ? la ligne de la pagination mobile.
- app/athletes et app/api/athletes : raccordement au lecteur distinct des anciens services. Les pages non raccord?es restent informatives. Navigation limit?e aux quatre blocs.
- lib/google-sheets.ts et lib/env.ts : anciens lecteurs de d?monstration refus?s et pseudo-IDs FEACO vid?s ; les ?critures restent refus?es. proxy.ts bloque les anciennes API non raccord?es et les modules exclus.
- app/page.tsx, layout, Header/Sidebar/DashboardLayout, navigation, package/lock, configuration Next et .gitignore : identit? FCTT, redirection vers Joueurs, port 3049, cache s?par? et secrets/artefacts ignor?s.

### Variables ? renseigner plus tard

L'utilisateur confirme : ? toi param?tre seulement, je vais les renseigner plus tard ; cr?er un env example ?. Aucune .env.local cr??e ou modifi?e, aucun secret demand? dans le chat. .env.example contient des valeurs vides.

| Variable | R?le | Quand |
| --- | --- | --- |
| GOOGLE_CLIENT_EMAIL | Compte de service ayant acc?s aux classeurs FCTT. | Requis pour Joueurs |
| GOOGLE_PRIVATE_KEY | Cl? priv?e de ce compte, conserv?e c?t? serveur. | Requis pour Joueurs |
| FCTT_ACTEURS_SPREADSHEET_ID | 16ygu-GXAzlzOa7O-F40ghq8NEQEAVqqG8hd9oSzIPuU | Requis pour Joueurs |
| FCTT_REFERENTIELS_SPREADSHEET_ID | 15YIULm6mASxqi7PPOA7HaxDr7N5fgpJ2FTu9zvnEhkU | Requis pour Joueurs |
| FCTT_COMPETITIONS_SPREADSHEET_ID | 1uuYY-tOrury2LNxkbBuM6VPji0kHfysxz5Gbu98H6rs | Lot Comp?titions |
| FCTT_ACTIVITES_SPREADSHEET_ID | 14BRt8HthoM8zgp1MzgwJ02AX57i-8pkySh252b8BFl4 | Lot Activit?s |
| FCTT_DOCUMENTS_SPREADSHEET_ID | 1XtIua10txcZteKQps8SLcFC7JKTn5Fh0iLQ55ndIn4k | Lot Documents |

Les valeurs sont ? renseigner dans data/monosport/fctt-managment/.env.local ou dans l'environnement du processus Next. Aucun classeur utilisateurs n?cessaire ? ce lecteur local ; aucun syst?me de session ajout?. L'exposition hors machine reste exclue de ce lot.

### Preuves de v?rification et limites

| Couche | R?sultat r?ellement observ? |
| --- | --- |
| Connecteur Drive | M?tadonn?es/en-t?tes r?els confirm?s ; ATHLETES vide ; trois r?f?rentiels lus. |
| SDK applicatif Google | Test diff?r? : les quatre variables du premier parcours sont absentes. Aucun succ?s de connexion revendiqu?, aucun test d?pendant lanc?. |
| Mod?le et lecteur simul? | 10 tests r?ussis : vide, colonnes r?ordonn?es y compris r?f?rences, projections s?res, fiche filtr?e avant coordonn?es, ID introuvable sans enrichissement, cl?s dupliqu?es/absentes, sch?ma invalide, erreurs r?seau assainies, valeurs vides, FORMATS_ID, configuration et acc?s local. |
| Interface isol?e | Script fctt-players-ui-qa.cjs r?ussi : ?tat Aucun joueur enregistr?, fixture de 26 joueurs, pagination 10/10/6, recherche par ID, filtre Sexe, fiche diff?r?e, erreur 503 simul?e puis reprise, fermeture ?chap, recherche pr?serv?e, absence des champs passeport/licence/BWF/FIE, mobile 390 px sans d?bordement. Aucune requ?te Sheets ni ?criture. |
| TypeScript | npm.cmd run typecheck : code 0. |
| Lint | npm.cmd run lint : code 0 (ESLint r?el dans ce d?p?t). |

Le premier test de r?ordonnancement a r?v?l? une fixture de r?f?rence mal rembourr?e avant permutation ; correction de cette fixture, puis 10/10 r?ussis. Les essais navigateur ont r?v?l? les noms accessibles manquants sur les boutons de pagination puis les filtres ; labels ajout?s, reprise r?ussie. Le lien du shim de test a re?u un contenu explicite pour le lint d'accessibilit?. Ce sont des v?rifications du code FCTT actuel, pas une reprise des anciens r?sultats FEACO.

Captures sous test-results/fctt/ (ignor?es Git), ?tat vide, fiche simul?e et liste mobile examin?s visuellement. Les joueurs simul?s n'existent que dans tests/fctt/ui-entry.tsx, jamais import?s par une route. L'outillage esbuild/Playwright d?j? install? dans le workspace est charg? en lecture seule, sans modifier de d?p?t de r?f?rence.

Pas de build complet ? ce premier point de contr?le, conform?ment ? la consigne. Aucun sch?ma Drive modifi?, aucune ?criture de test en production, aucun push ni d?ploiement. La cr?ation, l'unicit? ? l'allocation et la stabilit? des cl?s en mutation restent ? impl?menter et tester dans le lot formulaires ; elles ne sont pas pr?sent?es comme valid?es ici.

### Prochaine action exacte

1. Montrer ce point de contr?le ? http://127.0.0.1:3049/athletes : sans variables, l'?tat actuel doit ?tre une erreur de configuration explicite. Le rendu vide valid? en test correspond ? ATHLETES r?ellement vide ; il sera affich? apr?s une lecture applicative r?ussie. La fiche est v?rifi?e seulement sur fixtures tant qu'aucun joueur r?el n'existe.
2. Quand l'utilisateur fournira les variables, red?marrer Next puis tester SDK/API/listes en lecture seule. V?rifier le vrai ?tat Aucun joueur enregistr? et les erreurs distinctes ; ne pas ?crire de faux joueur dans le classeur pour la recette.
3. Apr?s ce point de contr?le, raccorder les formulaires Joueur et les cinq cat?gories : formats TTB-*, r?f?rences par ID, dates calendaires, ID immuable en correction, unicit? en cr?ation avec allocation s?re ; mutations uniquement sur fixtures/classeur de test autoris? avant activation. Garder date_affiliation dans l'acteur et ITTF facultatif l? o? la colonne existe.
4. Comp?titions : lire les vrais en-t?tes avant code, FED017 -> TTB -> DISC072, ?dition/?preuve/catalogue EPREUVES, unit?s simples/paires et membres distincts, phases manuelles. R?sultat = manches gagn?es ; COMPETITIONS_SETS = points par manche, id_set/numero_set conserv?s. Pas de valeur inconnue remplac?e par z?ro ou de global recalcul? depuis un d?tail partiel. D?tail d?clar? complet ? v?rifier contre le r?sultat, relations/unicit? c?t? serveur, intervenants/distinctions apr?s recette, aucun seuil de r?glement ou tableau/ranking/rencontre par ?quipes automatique.
5. Activit?s/Documents : lire les six feuilles et r?f?rences r?elles avant raccordement, participants par type + ID et liens de fichiers prot?g?s, aucun t?l?versement. Les autres blocs restent informatifs dans ce lot.

Contr?les HTTP locaux : GET /api/athletes et /api/athletes/TTB-ATH-000001 -> 503 avec code configuration et les quatre noms manquants, sans appel Google ; POST /api/athletes -> 409 ; /ligues -> 404 ; /api/licences/athletes -> 410. Les r?f?rences FEBADCO et FCE ont conserv? leur ?tat Git initial.

Point m?tier ? clarifier au lot formulaires : SEX099/AUTRE et le statut AUTRE portent une obligation de pr?cision dans les r?f?rentiels, alors que ATHLETES ne contient pas de colonne observations/pr?cision. Ne pas inventer de champ ? ?crire ni modifier le classeur pour r?soudre cet ?cart sans validation. Aucun impact sur la consultation actuelle vide.

Rendu Next local confirme : GET /athletes -> 200 avec le bloc Configuration FCTT incomplete ; le message Aucun joueur enregistre n’est pas affiche lorsque la configuration manque. Serveur 127.0.0.1:3049 laisse actif pour ce point de controle. .env.local toujours absent et a renseigner plus tard par l’utilisateur.
