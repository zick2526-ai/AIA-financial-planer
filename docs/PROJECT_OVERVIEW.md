# Project Overview

## Purpose

AIA Financial Planner is an advisor-facing planning web application for collecting client information, reviewing financial position, recording policies and family members, identifying protection gaps, analysing health-insurance needs, comparing verified product options and generating client-facing reports.

## Primary users

- Individual financial / insurance advisors
- Team leaders and administrators
- Future SaaS customers under Pro and Team plans

## Core user journey

1. Advisor signs in.
2. Advisor creates or selects a client.
3. Advisor records financial information, family, goals and existing policies.
4. Policy documents can be photographed or uploaded; OCR assists with field extraction.
5. Dashboard summarises protection, premiums, health limits and policy portfolio.
6. Health Planner calculates current coverage, target coverage and Health Coverage Gap.
7. Verified health product records are ranked against client needs.
8. Advisor saves the assessment and exports a client planning PDF.
9. Admin can inspect users and client portfolios with controlled access.

## Current deployment

The front end is deployed from GitHub Pages. Supabase provides database, authentication, row-level security, storage and server-side Edge Functions.

## Non-goals / guardrails

- Product recommendations must not invent benefits, premium rates or eligibility.
- OCR output is an assistant, not a final authoritative policy interpretation.
- Generated planning reports are decision-support documents and should be checked against current policy/product documents before presentation.

## Current major capabilities

- Client database
- Financial profiles
- Assets and liabilities
- Goals
- Family members
- Policy portfolio
- Policy document upload
- Browser OCR for policy images
- Insurance dashboard
- Thai tax planning module
- Health Planner / AIA analysis layer
- Health product catalog
- Admin portal
- Client PDF planning report

## Future direction

Likely commercial model: web SaaS with Trial, Pro and Team tiers, subscription/licensing, stronger product catalog administration, automated billing, PWA installation and production-grade monitoring/backups.
