# /AIA v2 Integration

## Goal

Integrate the `/AIA` advisor-analysis workflow into AIA Financial Planner without duplicating product facts or bypassing Product Catalog governance.

## Production workflow

1. Advisor selects a client.
2. Open **/AIA v2 · วิเคราะห์กรมธรรม์** from the Planner menu.
3. Existing policies are read from `insurance_policies`.
4. Current coverage and target coverage are converted into Protection / Health gaps.
5. Candidate AIA products come only from verified Product Catalog records.
6. AI creates the customer-facing comparison, selling reasons, cautions and LINE message.
7. Advisor reviews the result before approval.
8. Only an approved comparison can generate the client PDF.

## Existing modules used

- `policy-scanner.js` — policy image / document capture assistance
- `insurance-review-v48.js` — deterministic existing-policy snapshot and gap calculation
- `insurance-review-ai-v50.js` — AI comparison and customer-facing explanation
- `advisor-review-v51.js` — advisor review, approval gate and PDF generation
- `sales-comparison-ui-v52.js` — sales-comparison presentation
- `sales-advisor-v53.js` — advisor-facing sales support
- `comparison-attachments-v55.js` — comparison source attachments
- `insurance-review-menu-v49.js` — `/AIA v2` Planner launcher

## Data governance

The Skill is the decision-support workflow. Product facts remain database-driven.

### Product source of truth

- General catalog: `product_catalog`
- Health-specific plan structure: `health_product_plans`
- Original brochures / specifications should remain traceable through source references.

Only records marked verified and active should be used for customer recommendations.

## /AIA v2 guardrails

- Never guess unreadable policy values.
- Do not automatically add rider limits unless the contract wording establishes that they stack.
- Separate verified facts from fields that require advisor review.
- Compare the existing policy respectfully; position recommendations as closing a protection / medical-cost gap rather than declaring the old policy bad.
- Surface deductible, co-pay, waiting-period, exclusions and underwriting cautions when known.
- Never present sample or indicative premium as a guaranteed quotation.
- Recheck current official product documents before customer presentation.
- Do not cancel or replace an existing policy solely from automated analysis.

## Customer output contract

A completed `/AIA v2` analysis should be able to produce:

1. Existing coverage summary
2. Gap analysis
3. Existing plan vs AIA comparison table
4. Reasons to consider the AIA plan
5. Material cautions / fields requiring verification
6. Short LINE-ready customer message
7. Advisor review status
8. Approved client PDF

## Product Catalog expansion

New AIA product data should be added to the catalog rather than hard-coded into `/AIA` JavaScript. This allows the same verified facts to be reused by Health Planner, AI Insurance Review, reports and future recommendation modules.

Recommended product metadata includes:

- provider
- product / plan name
- category
- version / effective date
- eligible age range
- annual / episode limits
- room / ICU / surgery / OPD benefits where relevant
- cancer / dialysis / CI fields where relevant
- deductible / co-pay fields
- suitable customer profile
- reasons to consider
- cautions
- source document reference
- source checked date
- verification status
- active / inactive state

## Current integration status

`/AIA v2` is exposed from the Planner menu and routes into the existing deterministic comparison → AI analysis → Advisor Review → approved PDF pipeline. Product facts continue to come from the verified catalog rather than the Skill file itself.
