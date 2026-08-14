---
slug: readmissions-hospitalieres
title: Ce qui prédit une réadmission hospitalière à 30 jours chez les patients diabétiques
role: Analyste, équipe de 3 — Projet de fin d'études en analytique des données, Miami Dade College
headline: "La durée du séjour et le nombre de médicaments sont fortement liés entre eux, mais presque sans rapport avec le fait qu'un patient diabétique soit réadmis dans les 30 jours."
coverAlt: "Boîtes à moustaches de la durée du séjour et du nombre de médicaments selon la réadmission à 30 jours, à côté d'une matrice de corrélation montrant que ces deux variables sont corrélées à 0,466 entre elles mais seulement à 0,044 et 0,038 avec la réadmission"
---

## Problème

Les réadmissions à 30 jours augmentent les coûts, pèsent sur la capacité hospitalière et signalent souvent des lacunes dans la préparation de la sortie. Les patients diabétiques sont réadmis à des taux élevés en raison de la complexité de la prise en charge de la maladie et de ses comorbidités. L'objectif était d'identifier les facteurs associés à un retour dans les 30 jours.

## Données

Le jeu de données Diabetes 130-US Hospitals de l'UCI Machine Learning Repository — 101 766 séjours répartis sur 130 hôpitaux, de 1999 à 2008, avec 50 variables couvrant les données démographiques, les diagnostics, le recours aux soins, les médicaments et les résultats de laboratoire. La variable `weight` a été écartée en raison d'un taux de valeurs manquantes d'environ 96 %. Les enregistrements dont le sexe était invalide ont été supprimés ; les valeurs manquantes de `race` ont été conservées sous forme de catégorie explicite « Manquant » plutôt que d'écarter des enregistrements entiers. Les valeurs manquantes de `max_glu_serum` et `A1Cresult` sont devenues « Non testé », car un résultat de laboratoire absent signifie que l'examen n'a pas été prescrit, et non que la valeur est inconnue. La variable de réadmission à trois niveaux a été ramenée à une variable binaire `readmitted_30`.

## Méthode

D'abord une analyse exploratoire et un examen des corrélations, puis un test d'indépendance du khi-deux entre le statut de traitement antidiabétique et la réadmission, puis une régression logistique sur les prédicteurs démographiques et cliniques. Environ 11 % des séjours correspondaient à des réadmissions ; la régression a donc utilisé des poids de classe équilibrés — avec un tel déséquilibre, l'exactitude brute récompenserait un modèle qui prédit « aucune réadmission » pour tout le monde.

<!-- [FILL] AUC et précision/rappel issus du notebook — à compléter par le propriétaire. -->

## Résultats

La durée du séjour et le nombre de médicaments sont modérément corrélés entre eux (r = 0,466), ce qui n'a rien de surprenant. Ni l'un ni l'autre n'est corrélé de façon significative avec la réadmission à 30 jours : r = 0,044 et r = 0,038 respectivement. Les boîtes à moustaches le confirment — les patients réadmis présentaient des durées de séjour quasi identiques et seulement marginalement plus de médicaments.

Le seul signal significatif était le statut de traitement antidiabétique. Environ 11,6 % des patients sous traitement antidiabétique ont été réadmis dans les 30 jours, contre environ 9,6 % de ceux qui ne l'étaient pas — un écart d'environ 2 points de pourcentage, significatif au test du khi-deux mais faible. Cet écart n'était pas uniforme selon l'âge. Chez les patients de 20 à 30 ans, il atteignait 5,8 points (15,4 % contre 9,6 %), le plus élevé observé. Les patients de 80 ans et plus présentaient un écart d'environ 3,7 points. Entre 30 et 80 ans, la différence était systématiquement plus faible.

Le statut de traitement reflète probablement la gravité de la maladie plutôt qu'il ne cause la réadmission : il s'agit donc d'une association, et non d'un effet causal.

## Portée

Les marqueurs cliniques intuitifs — séjours plus longs, davantage de médicaments — n'identifient pas les patients qui reviennent. Un processus de préparation à la sortie fondé sur ces critères ciblerait pour l'essentiel les mauvais patients. Le résultat exploitable est plus étroit : les jeunes patients diabétiques sous traitement sont réadmis à des taux nettement plus élevés que le schéma général ne le laisse supposer, et constituent une cible défendable pour un suivi téléphonique. Aller plus loin exige des variables absentes de ce jeu de données — statut socio-économique, observance du traitement et accès aux soins de suivi.
