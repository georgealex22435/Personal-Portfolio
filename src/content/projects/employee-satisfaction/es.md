---
slug: satisfaccion-laboral
title: Qué mueve realmente la satisfacción laboral
role: Proyecto individual
headline: "El nivel de estrés y el entorno de trabajo predijeron la satisfacción laboral; las características demográficas, en gran medida, no."
coverAlt: "Gráfico de barras agrupadas de la satisfacción laboral en cinco niveles de estrés, con los recuentos más altos concentrados en el nivel de estrés más bajo"
---

## Problema

Las organizaciones suelen suponer que la satisfacción varía según el grupo demográfico y orientan en consecuencia sus programas de retención. Este proyecto comprobó qué factores se asocian realmente con la satisfacción laboral declarada.

## Datos

Un conjunto de datos de encuesta con 3 025 respuestas sobre satisfacción, estrés, entorno de trabajo y atributos demográficos. Los datos son sintéticos (procedentes de Kaggle), lo que acota el alcance de las conclusiones.

## Método

Tres familias de pruebas, elegidas según el tipo de variable: chi-cuadrado para asociaciones entre variables categóricas, ANOVA para diferencias de medias entre grupos y regresión lineal múltiple para evaluar los predictores de forma simultánea. Análisis realizado en R, con todo el flujo de trabajo publicado como informe de R Markdown.

## Resultados

El nivel de estrés mostró una asociación fuerte con la satisfacción, y el entorno de trabajo fue un predictor significativo en la regresión. Las variables demográficas aportaron comparativamente poco una vez incorporados al modelo los factores del puesto.

**Limitaciones.** El conjunto de datos es sintético. Las relaciones estadísticas son reales dentro de él, pero fueron generadas y no observadas, de modo que las conclusiones de fondo deben leerse como una demostración de método y no como un hallazgo sobre centros de trabajo reales.

## Implicaciones

Los factores que aquí predijeron la satisfacción son aquellos sobre los que un empleador puede actuar —carga de trabajo y entorno— y no aquellos sobre los que no puede. Ese es el punto más útil al que dirigir un programa de retención, y puede comprobarse con datos reales de encuestas internas siguiendo exactamente este flujo de trabajo.
