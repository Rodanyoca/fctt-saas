# FCTT - consignes du d?p?t

Modifier uniquement ce d?p?t. Avant de reprendre un lot, lire `docs/FCTT_VALIDATION.md` pour le mapping, les preuves de v?rification et la prochaine action.

R?f?rence principale en lecture seule : `../febadco-managment` pour les interfaces et le mod?le simples/doubles/manches. R?f?rence secondaire : `../fce-managment` pour l'affiliation directe et les quatre blocs minimaux. Les documents FEACO h?rit?s sont des archives.

P?rim?tre : Acteurs, Comp?titions, Activit?s, Documents. Affiliation directe via date_affiliation ; ID f?d?ral permanent distinct d'une licence, r?f?rence externe id_ittf facultative. Les lecteurs actifs sont dans lib/fctt ; les anciens adaptateurs de d?monstration refusent les lectures et ?critures.

Avant tout nouveau raccordement, lire les en-t?tes r?els et r?soudre les colonnes par nom. Pr?server les ?tats vide, configuration, connexion et sch?ma distincts. Limiter les DTO de liste ; charger les coordonn?es et d?tails secondaires ? la demande. R?utiliser lib/compact-date.ts pour les dates et conserver les valeurs absentes.

L'utilisateur renseigne les variables plus tard. Maintenir .env.example sans secrets ; laisser .env.local ? sa main et diff?rer les tests connect?s tant que la configuration manque. Acc?s local et refus des mutations conserv?s. Authentification, utilisateurs et m?dias hors p?rim?tre. Aucun push, d?ploiement, changement de sch?ma Drive ou test d'?criture en production.
