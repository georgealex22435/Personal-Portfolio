---
slug: employee-satisfaction
title: What actually moves employee satisfaction
role: Solo project
headline: "Stress level and work environment predicted job satisfaction; demographic characteristics largely did not."
coverAlt: "Grouped bar chart of job satisfaction ratings across five stress levels, with the largest counts concentrated at the lowest stress level"
---

## Problem

Organizations often assume satisfaction varies by demographic group and target retention programs accordingly. This project tested which factors are actually associated with reported job satisfaction.

## Data

A survey dataset of 3,025 responses covering satisfaction, stress, work environment, and demographic attributes. The data is synthetic (sourced from Kaggle), which bounds how far the conclusions travel.

## Approach

Three families of test, chosen to match the variable types: chi-square for categorical associations, ANOVA for group mean differences, and multiple linear regression to evaluate predictors simultaneously. Analysis in R, with the full workflow published as a rendered R Markdown report.

## Findings

Stress level showed a strong association with satisfaction, and work environment was a significant predictor in the regression. Demographic variables contributed comparatively little once the workplace factors were in the model.

**Limitations.** The dataset is synthetic. The statistical relationships are real within it, but they were generated rather than observed, so the substantive conclusions should be read as a demonstration of method rather than a finding about real workplaces.

## So what

The factors that predicted satisfaction here are ones an employer can change — workload and environment — rather than ones they cannot. That is the more useful place to aim a retention program, and it is testable on real internal survey data using exactly this workflow.
