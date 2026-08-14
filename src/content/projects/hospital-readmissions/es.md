---
slug: reingresos-hospitalarios
title: Qué predice un reingreso hospitalario a 30 días en pacientes diabéticos
role: Analista, equipo de 3 — Proyecto final de Analítica de Datos, Miami Dade College
headline: "La duración de la estancia y el número de medicamentos están estrechamente relacionados entre sí, pero apenas guardan relación con que un paciente diabético reingrese en un plazo de 30 días."
coverAlt: "Diagramas de caja de la duración de la estancia y del número de medicamentos según el reingreso a 30 días, junto a un mapa de calor de correlaciones que muestra que ambas variables se correlacionan a 0,466 entre sí pero solo a 0,044 y 0,038 con el reingreso"
---

## Problema

Los reingresos a 30 días elevan los costes, tensionan la capacidad hospitalaria y a menudo señalan carencias en la planificación del alta. Los pacientes diabéticos reingresan con tasas elevadas debido a la complejidad del manejo de la enfermedad y de sus comorbilidades. El objetivo era identificar qué factores del paciente se asocian con un retorno en un plazo de 30 días.

## Datos

El conjunto de datos Diabetes 130-US Hospitals del UCI Machine Learning Repository — 101 766 episodios en 130 hospitales, de 1999 a 2008, con 50 variables sobre datos demográficos, diagnósticos, uso de servicios, medicación y resultados de laboratorio. La variable `weight` se descartó por presentar en torno a un 96 % de valores ausentes. Se eliminaron los registros con sexo no válido; los valores ausentes de `race` se conservaron como una categoría explícita «Ausente» en lugar de descartar registros completos. Los valores ausentes de `max_glu_serum` y `A1Cresult` pasaron a ser «No analizado», ya que un resultado de laboratorio ausente significa que la prueba no se solicitó, no que el valor se desconozca. La variable de reingreso de tres niveles se redujo a una variable binaria `readmitted_30`.

## Método

Primero un análisis exploratorio y una revisión de correlaciones, después una prueba de independencia de chi-cuadrado entre el estado de medicación antidiabética y el reingreso, y por último una regresión logística sobre predictores demográficos y clínicos. Alrededor del 11 % de los episodios fueron reingresos, por lo que la regresión empleó pesos de clase equilibrados: con ese desequilibrio, la exactitud bruta premiaría a un modelo que predijera «sin reingreso» para todo el mundo.

<!-- [FILL] AUC y precisión/exhaustividad del notebook — pendiente de aportar por el propietario. -->

## Resultados

La duración de la estancia y el número de medicamentos están moderadamente correlacionados entre sí (r = 0,466), lo cual no sorprende. Ninguno de los dos guarda una correlación apreciable con el reingreso a 30 días: r = 0,044 y r = 0,038 respectivamente. Los diagramas de caja lo confirmaron: los pacientes que reingresaron presentaban duraciones de estancia casi idénticas y solo marginalmente más medicamentos.

La única señal significativa fue el estado de medicación antidiabética. En torno al 11,6 % de los pacientes con medicación antidiabética recetada reingresaron en un plazo de 30 días, frente a alrededor del 9,6 % de quienes no la tenían: una diferencia de unos 2 puntos porcentuales, significativa según chi-cuadrado pero pequeña. La diferencia no era uniforme entre edades. Entre los pacientes de 20 a 30 años se ampliaba hasta 5,8 puntos (15,4 % frente a 9,6 %), la mayor observada. Los pacientes de 80 años o más mostraban una diferencia de unos 3,7 puntos. Entre los 30 y los 80 años la diferencia fue sistemáticamente menor.

El estado de medicación probablemente actúa como indicador indirecto de la gravedad de la enfermedad más que como causa del reingreso, por lo que se trata de una asociación y no de un efecto causal.

## Implicaciones

Los marcadores clínicos intuitivos —estancias más largas, más fármacos— no identifican a quienes vuelven. Un proceso de planificación del alta basado en ellos señalaría en su mayoría a los pacientes equivocados. El hallazgo accionable es más acotado: los pacientes diabéticos jóvenes con medicación reingresan con tasas notablemente superiores a lo que sugiere el patrón general, y constituyen un objetivo defendible para un contacto de seguimiento. Ir más allá exige variables que este conjunto de datos no contiene: nivel socioeconómico, adherencia al tratamiento y acceso a la atención de seguimiento.
