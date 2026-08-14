---
slug: antique-store-database
title: Designing a relational schema for an antique store
role: Solo project
headline: "A normalized six-table schema with a self-referencing category hierarchy, built so the business questions could be answered in SQL rather than in spreadsheets."
coverAlt: "Entity-relationship diagram of the antique store database"
---

## Problem

A small retail business with one-of-a-kind inventory — every item unique, categories nested arbitrarily deep, and each sale tied to a specific piece rather than a SKU with stock levels. Spreadsheets break on this quickly.

## Data

Modeled from the domain rather than an existing dataset: items, categories, customers, sales, and supporting entities across six tables, with seed data to exercise the queries.

## Approach

Normalized to third normal form, with a self-referencing foreign key on the category table so hierarchies of any depth are supported without schema changes. Constraints, keys, and referential integrity enforced at the database level rather than in application code. Design documented as an EER diagram, then implemented in MySQL and validated against eight business queries.

## Findings

This is a design project, so the result is the schema itself. The two decisions that mattered: the self-referencing category hierarchy, which avoids the fixed-depth category columns that make retail schemas rigid; and modeling inventory as unique items rather than stock-keeping units, which matches how the business actually works.

## So what

The queries the owner would actually ask — best-selling categories, customer purchase history, inventory aging — are single statements against this schema instead of manual spreadsheet work.
