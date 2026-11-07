# Validation FEACO — 2026-10-02

## Contrôles techniques
- Installation npm depuis le lockfile : 516 dépendances; aucune version mise à niveau. Les avertissements de dépréciation appartiennent au lockfile source.
- TypeScript strict : réussi; `ignoreBuildErrors` désactivé.
- ESLint : réussi après les derniers changements.
- Premier build de production : réussi, routes listées. Build final après validation des dates : réussi (compilation, TypeScript strict et génération des routes).
- 18 tests existants pertinents passent : 5 dates, 6 navigation, 3 mapping territorial, 3 paramètres, 1 unicité des lignes de tableaux. Aucun test écrit sur Google Sheets.

## Navigateur Chromium local
- 21 parcours en HTTP 200, titre présent et un seul bandeau de démonstration.
- 15 ouvertures de formulaires et fermetures par Échap vérifiées.
- 9 fiches territoriales/acteurs : détail, modification et annulation vérifiés.
- Ligue : aucun onglet dans le détail.
- Club : liste d’athlètes directement rattachés, aucune équipe intermédiaire.
- Recherche : état vide puis retour aux données après remise à zéro.
- Dates : saisie de `31022024` → `31/02/2024` invalide, erreur près du champ; `29022024` valide; date vide reste vide.
- Sauvegarde fictive : POST retourne 409, message explicite, formulaire reste ouvert; aucun succès.
- Cinq écritures API (création acteur, modification club, suppression document, résultat compétition, licence) refusées en HTTP 409.
- Historique d’affiliation d’un athlète : lecture locale 200, deux relations historiques distinctes.
- Équipe nationale : détail et onglets Athlètes/Staff/Compétitions/Résultats accessibles.
- Résultats compétition : état d’adaptation explicite; aucune action de saisie de sets.
- Mobile 390×844 : Clubs, Athlètes, Compétitions, Documents sans débordement horizontal. Navigation mobile, fermeture par Échap et focus clavier vérifiés.
- Desktop 1440×900 : aucun débordement horizontal sur les parcours testés.
- Aucune erreur JavaScript ni requête externe sur les 21 parcours.

Résultats détaillés : `browser-results.json`, `interaction-results.json`. Reproduire avec `node scripts/verify-local.cjs` et `node scripts/verify-interactions.cjs` après démarrage sur le port 3006. Ces scripts utilisent le Playwright déjà présent dans le workspace en lecture seule; `PLAYWRIGHT_MODULE` permet d’indiquer une autre installation.

## Comparaison visuelle et limites
29 captures FEACO sont conservées dans `screenshots/`. La liste des clubs, le détail club et le mobile ont été inspectés à l’écran. La capture FEVOCO disponible `docs/design-qa-assets/fevoco-club-detail-after-1440.png` a été inspectée à la même largeur; elle montre une ancienne navigation et une densité de données différente. Il ne s’agit donc pas d’une comparaison exhaustive entre deux applications actuelles dans des états équivalents.

Les styles globaux, layout, tableaux, panneaux, modales, détail ligue et détail club sont identiques au code local FEVOCO après substitution d’identité. Le rendu observé conserve les fonds, largeur 256px, header, marges, cartes, boutons dorés et tables. Écarts volontaires : logo neutre, bandeau de démonstration (+33px environ sur desktop), retrait FIVB/poste volleyball, modules de compétition non applicables explicitement isolés. La fidélité de toutes les vues actuelles FEVOCO n’est pas certifiée par captures comparatives faute de serveur référence actif; seul CNAC était actif sur le port 3000 et il n’a pas été modifié.

Aucune connexion réelle FEACO disponible : tous les exemples sont locaux. Les grades/spécialités/disciplines/catégories officielles restent vides, pas inventés. Les règles de licences, résultats athlétisme, activations/campagnes nationales et complétude restent à confirmer. Aucune fonctionnalité absente de la référence présentée comme copiée.

## Version locale servie

Build final lancé avec `npm run start -- --port 3006`. Contrôle de production réussi : liste/détail clubs, historique local des affiliations (200), refus de création de licence (409). Capture `screenshots/club-detail-production.png`. URL locale : http://localhost:3006.

## Git et fichiers
Nouveau dépôt FEACO indépendant sur `main`, aucun commit et aucun remote. Tous les fichiers sont nouveaux/non suivis; `git diff --stat` est donc vide. Les groupes créés sont `app/`, `components/`, `hooks/`, `lib/`, `styles/`, `public/`, `docs/`, `scripts/`, configurations npm/Next/TypeScript/ESLint, README, AGENTS et `.env.example` sans secrets. 366 fichiers applicatifs portés. La matrice détaille les fichiers de chaque interface et ses services.

L’état Git FEVOCO avant/après est inchangé. Aucun fichier CNAC, COC, FEBACO ou FEHAND modifié. Aucun push, merge, déploiement, compte, session ou secret copié.
