---
slug: hospital-readmissions
title: What predicts a 30-day hospital readmission for diabetes
role: Analyst, 3-person team — Data Analytics Capstone, Miami Dade College
headline: "Length of stay and medication count are strongly related to each other, but almost unrelated to whether a diabetes patient comes back within 30 days."
coverAlt: "Boxplots of length of stay and medication count by 30-day readmission status, beside a correlation heatmap showing both variables correlate at 0.466 with each other but only 0.044 and 0.038 with readmission"
---

## Problem

Thirty-day readmissions raise costs, strain hospital capacity, and often signal gaps in discharge planning. Diabetes patients are readmitted at elevated rates because of the complexity of managing the condition and its comorbidities. The goal was to identify which patient factors are associated with returning within 30 days.

## Data

The Diabetes 130-US Hospitals dataset from the UCI Machine Learning Repository — 101,766 encounters across 130 hospitals, 1999–2008, with 50 variables covering demographics, diagnoses, utilization, medications, and lab results. `weight` was dropped for roughly 96% missingness. Records with invalid gender were removed; missing `race` was retained as an explicit "Missing" category rather than discarding whole records. Missing `max_glu_serum` and `A1Cresult` became "Not Tested", since a missing lab result means the test wasn't ordered, not that the value is unknown. The three-level readmission variable was collapsed into a binary `readmitted_30`.

## Approach

Exploratory analysis and correlation review first, then a chi-square test of independence for diabetes-medication status against readmission, then logistic regression across demographic and clinical predictors. Roughly 11% of encounters were readmissions, so the regression used balanced class weights — with that imbalance, raw accuracy would reward a model that predicts "no readmission" for everyone.

<!-- [FILL] AUC and precision/recall from the notebook. The owner is closing this gap;
     do not invent a number. Listed in the handback notes. -->

## Findings

Length of stay and medication count are moderately correlated with each other (r = 0.466), which is unsurprising. Neither is meaningfully correlated with 30-day readmission: r = 0.044 and r = 0.038 respectively. Boxplots confirmed it — readmitted patients had near-identical stay lengths and only marginally more medications.

The one significant signal was diabetes-medication status. Roughly 11.6% of patients prescribed diabetes medication were readmitted within 30 days, against roughly 9.6% of those who were not — a chi-square-significant but small gap of about 2 percentage points. The gap was not uniform across ages. Among patients aged 20–30 it widened to 5.8 points (15.4% vs 9.6%), the largest observed. Patients aged 80 and older showed a gap of about 3.7 points. Between 30 and 80 the difference was consistently smaller.

Medication status likely proxies disease severity rather than causing readmission, so this is an association, not a causal effect.

## So what

The intuitive clinical markers — longer stays, more drugs — do not identify who comes back. A discharge-planning process built on them would mostly flag the wrong patients. The finding worth acting on is narrower: younger diabetes patients on medication are readmitted at noticeably higher rates than the overall pattern suggests, and are a defensible target for follow-up contact. Getting past that requires variables this dataset does not carry — socioeconomic status, treatment adherence, and access to follow-up care.
