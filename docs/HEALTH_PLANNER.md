# Health Planner / AIA Analysis

## Purpose

Health Planner converts a client's existing health coverage and needs into a structured gap analysis, then compares those needs against verified product records.

## Inputs

Typical inputs include:
- budget per year
- employer / welfare room benefit
- employer annual medical benefit
- preferred hospital room cost
- target annual medical limit
- deductible preference
- hospital preference
- OPD requirement
- cancer focus
- critical-illness focus
- insured sex

The module also reads existing `insurance_policies` for the selected client.

## Gap calculations

Key outputs include:
- current health coverage
- target annual coverage
- annual Health Coverage Gap
- room-cost gap
- budget context

The saved result is stored in `health_assessments.analysis`.

## Recommendation architecture

Recommendations must be catalog-driven.

`health_product_plans` is the source of product facts. The ranking engine scores active plans against client needs, including annual limit, room benefit, deductible/co-pay profile, OPD, critical illness/cancer priorities and budget where verified premium data exists.

The `/AIA` concept is a decision-support layer, not permission to invent product facts.

## Current catalog direction

Current verified data includes AIA Health CI Hero plan structures sourced from uploaded brochures, including 2M / 6M / 12M levels and Begin/Balanced variants. AIA Health Happy should only be expanded when current source documents provide sufficient verified plan data.

## Safety / suitability guardrails

- Show why a plan ranks highly.
- Show material co-pay/deductible conditions.
- Display cautions where product facts are incomplete.
- Do not present an indicative premium as a guaranteed quotation.
- Recheck the latest official sales document before customer presentation.
- Underwriting, exclusions and final premium remain subject to insurer rules.

## Future improvement

Recommended future work:
- structured premium tables by age/sex/variant
- source-document version and effective dates
- product expiration/inactivation workflow
- admin catalog editor
- rule-engine tests for ranking
- AI-generated explanation from structured facts, while keeping deterministic product facts in the database
