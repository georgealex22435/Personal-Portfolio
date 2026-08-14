---
slug: base-donnees-antiquaire
title: Concevoir un schéma relationnel pour un magasin d'antiquités
role: Projet individuel
headline: "Un schéma normalisé de six tables doté d'une hiérarchie de catégories auto-référencée, conçu pour que les questions métier trouvent leur réponse en SQL plutôt que dans un tableur."
coverAlt: "Diagramme entité-association de la base de données du magasin d'antiquités"
---

## Problème

Un petit commerce de détail dont chaque article est unique — catégories imbriquées à une profondeur arbitraire, et chaque vente rattachée à une pièce précise plutôt qu'à une référence assortie d'un niveau de stock. Les tableurs atteignent vite leurs limites sur ce type de modèle.

## Données

Modélisées à partir du domaine plutôt qu'à partir d'un jeu de données existant : articles, catégories, clients, ventes et entités de support réparties sur six tables, avec des données d'amorçage permettant d'éprouver les requêtes.

## Méthode

Normalisation en troisième forme normale, avec une clé étrangère auto-référencée sur la table des catégories afin de prendre en charge des hiérarchies de profondeur quelconque sans modification du schéma. Contraintes, clés et intégrité référentielle appliquées au niveau de la base de données plutôt que dans le code applicatif. Conception documentée sous forme de diagramme entité-association étendu, puis implémentée sous MySQL et validée au moyen de huit requêtes métier.

## Résultats

Il s'agit d'un projet de conception : le résultat est donc le schéma lui-même. Deux décisions ont compté : la hiérarchie de catégories auto-référencée, qui évite les colonnes de catégories à profondeur fixe rendant les schémas de vente au détail rigides ; et la modélisation de l'inventaire en articles uniques plutôt qu'en unités de gestion de stock, ce qui correspond au fonctionnement réel du commerce.

## Portée

Les requêtes que le propriétaire poserait réellement — catégories les plus vendues, historique d'achat des clients, ancienneté du stock — deviennent de simples instructions sur ce schéma au lieu d'un travail manuel de tableur.
