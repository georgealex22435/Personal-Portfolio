---
slug: satisfaction-employes
title: Ce qui influence réellement la satisfaction des employés
role: Projet individuel
headline: "Le niveau de stress et l'environnement de travail prédisaient la satisfaction professionnelle ; les caractéristiques démographiques, dans une large mesure, non."
coverAlt: "Diagramme en barres groupées de la satisfaction professionnelle selon cinq niveaux de stress, les effectifs les plus élevés se concentrant au niveau de stress le plus faible"
---

## Problème

Les organisations supposent souvent que la satisfaction varie selon le groupe démographique et orientent leurs programmes de fidélisation en conséquence. Ce projet a testé quels facteurs sont réellement associés à la satisfaction professionnelle déclarée.

## Données

Un jeu de données d'enquête de 3 025 réponses portant sur la satisfaction, le stress, l'environnement de travail et des attributs démographiques. Les données sont synthétiques (issues de Kaggle), ce qui limite la portée des conclusions.

## Méthode

Trois familles de tests, choisies en fonction du type de variables : le khi-deux pour les associations entre variables catégorielles, l'ANOVA pour les différences de moyennes entre groupes, et la régression linéaire multiple pour évaluer les prédicteurs simultanément. Analyse réalisée sous R, l'ensemble du flux de travail étant publié sous forme de rapport R Markdown.

## Résultats

Le niveau de stress présentait une association forte avec la satisfaction, et l'environnement de travail constituait un prédicteur significatif dans la régression. Les variables démographiques contribuaient comparativement peu une fois les facteurs professionnels intégrés au modèle.

**Limites.** Le jeu de données est synthétique. Les relations statistiques y sont réelles, mais elles ont été générées plutôt qu'observées : les conclusions de fond doivent donc être lues comme une démonstration de méthode et non comme un résultat sur de véritables milieux de travail.

## Portée

Les facteurs qui prédisaient la satisfaction ici sont ceux sur lesquels un employeur peut agir — charge de travail et environnement — plutôt que ceux sur lesquels il ne peut rien. C'est là qu'un programme de fidélisation est le plus utile, et cela se vérifie sur de véritables données d'enquête interne avec exactement ce flux de travail.
