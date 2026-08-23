# Product Catalog Governance

## Principle

Product data is business-critical. The application must recommend only from verified structured data, with traceable source documents.

## Health catalog

Primary table: `health_product_plans`.

Each record should capture:
- provider
- product name
- plan / variant name
- eligible age range
- room limit
- annual limit
- deductible/co-pay structure
- OPD / cancer / CI benefits where applicable
- premium fields only when verified
- suitable customer profile
- reasons to consider
- cautions
- source reference
- source checked date
- active/inactive state

## Source policy

Preferred sources, in order:
1. Current official insurer brochure / sales document
2. Official product specification or approved internal source
3. User-provided official source document

Marketing posters may be used only for the fields they clearly establish. Do not infer missing plan limits, age ranges, premium rates or exclusions.

## Versioning

When a product changes:
- do not silently overwrite material historical terms if old reports may depend on them
- record source/effective date where practical
- deactivate obsolete catalog variants
- add new verified variants
- update Health Planner tests/logic if field semantics changed

## Recommendation rule

The recommendation engine may calculate suitability scores from catalog data, but it must not transform missing data into fabricated facts.

If data is incomplete, the UI/report should say that verification is required before proposal.

## Commercial expansion

The more general `product_catalog` table can support life, CI, retirement and other recommendations. Health-specific structured fields should remain in `health_product_plans` unless/until a normalized catalog redesign is completed.
