---
slug: base-datos-tienda-antiguedades
title: Diseñar un esquema relacional para una tienda de antigüedades
role: Proyecto individual
headline: "Un esquema normalizado de seis tablas con una jerarquía de categorías autorreferenciada, construido para que las preguntas del negocio se respondan en SQL y no en una hoja de cálculo."
coverAlt: "Diagrama entidad-relación de la base de datos de la tienda de antigüedades"
---

## Problema

Un pequeño comercio minorista con inventario irrepetible: cada artículo es único, las categorías se anidan a una profundidad arbitraria y cada venta se vincula a una pieza concreta y no a una referencia con niveles de existencias. Las hojas de cálculo se quedan cortas enseguida ante algo así.

## Datos

Modelados a partir del dominio y no de un conjunto de datos existente: artículos, categorías, clientes, ventas y entidades de apoyo repartidas en seis tablas, con datos de carga inicial para ejercitar las consultas.

## Método

Normalización hasta la tercera forma normal, con una clave foránea autorreferenciada en la tabla de categorías para admitir jerarquías de cualquier profundidad sin cambios de esquema. Restricciones, claves e integridad referencial aplicadas en la propia base de datos y no en el código de la aplicación. Diseño documentado como diagrama entidad-relación extendido, implementado después en MySQL y validado con ocho consultas de negocio.

## Resultados

Se trata de un proyecto de diseño, así que el resultado es el esquema en sí. Las dos decisiones que importaron: la jerarquía de categorías autorreferenciada, que evita las columnas de categoría de profundidad fija que vuelven rígidos los esquemas de comercio minorista; y modelar el inventario como artículos únicos en lugar de unidades de mantenimiento de existencias, lo que se corresponde con el funcionamiento real del negocio.

## Implicaciones

Las consultas que el propietario haría en la práctica —categorías más vendidas, historial de compras de clientes, antigüedad del inventario— pasan a ser sentencias únicas contra este esquema en lugar de trabajo manual en una hoja de cálculo.
