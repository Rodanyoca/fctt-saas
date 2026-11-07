# FCTT - F?d?ration congolaise de tennis de table

Premier point de contr?le : liste et fiche Joueur, affiliation directe ? la f?d?ration. R?f?rences FEBADCO et FCE consult?es en lecture seule. Voir [le mapping et la validation](docs/FCTT_VALIDATION.md).

```powershell
npm.cmd run dev
```

URL locale : http://127.0.0.1:3049/athletes. Les quatre blocs visibles sont Acteurs, Comp?titions, Activit?s et Documents. Les modules non encore raccord?s affichent leur ?tat de pr?paration, sans donn?e fictive.

Copier [.env.example](.env.example) vers `.env.local` et renseigner les valeurs c?t? serveur lorsque vous serez pr?t. Ce lot n'a cr?? ni modifi? `.env.local`. Les quatre variables Acteurs/R?f?rentiel/Google sont n?cessaires au lecteur Joueurs ; les trois variables des blocs suivants peuvent attendre. L'application signale les variables absentes. Elle ne remplace jamais un ?chec de lecture par une liste vide ou une d?mo.

La feuille ATHLETES est vide lors du contr?le Drive : une fois la connexion applicative valid?e, le r?sultat attendu est ? Aucun joueur enregistr? ?. Les tests connect?s sont diff?r?s selon la demande utilisateur. Les tests de fiche utilisent uniquement des joueurs simul?s dans un bundle navigateur isol?, jamais import? par les routes de l'application.

Contr?les : `node --experimental-strip-types --test tests/fctt/players.test.mjs`, `node scripts/fctt-players-ui-qa.cjs`, `npm.cmd run typecheck`, `npm.cmd run lint`. Le script navigateur utilise esbuild/Playwright d?j? install?s localement dans le workspace, en lecture seule ; aucun serveur ou outil n'est install? dans une r?f?rence.

Les mutations et m?dias restent indisponibles. Aucun changement de classeur, push ni d?ploiement.

<details><summary>Ancien README FEACO conserv? comme archive, non applicable ? FCTT</summary>

# FEACO — Fédération d’Athlétisme du Congo

Base locale créée depuis les interfaces réelles et l’état local courant de FEVOCO. Dépôt indépendant, aucun remote, secret ou service de production repris.

```powershell
npm ci
npm run dev
```

Ouvrir http://localhost:3006. Aucun compte nécessaire; cette duplication n’ajoute pas d’authentification. Les fiches sont fictives. Les formulaires et annulations sont explorables; sauvegardes, suppressions et uploads explicitement refusés sans succès simulé.

Voir [matrice](docs/FEACO_INTERFACE_MATRIX.md), [écarts](docs/FEACO_BUSINESS_GAPS.md), [suivi](docs/FEACO_STATUS.md), [validation](docs/FEACO_VALIDATION.md). Logo circulaire neutre. Référentiels et connexions FEACO restent à fournir. Aucun push, merge ni déploiement.

</details>
