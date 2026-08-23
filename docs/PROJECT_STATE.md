# Current Project State

Snapshot date: 2026-08-23 (Asia/Bangkok)

## Repository
- `zick2526-ai/AIA-financial-planer`
- Default/production branch: `main`
- Front end: GitHub Pages

## Production URLs
- App: `https://zick2526-ai.github.io/AIA-financial-planer/`
- Admin: `https://zick2526-ai.github.io/AIA-financial-planer/admin.html`

## Supabase
- Project ref: `tlmbwvtxsxdlxkcmropp`
- Region: `ap-northeast-1`
- Core services in use: Auth, Postgres/RLS, Storage, Edge Functions
- Private storage bucket: `policy-documents`
- Admin Edge Function: `admin-console`

## Production loader
`index.html` currently injects these add-on modules in addition to the frozen historical app:
- `policy-scanner.js`
- `admin-launcher.js`
- `db-bridge.js`
- `health-planner.js` (with cache version in loader)
- `report-generator.js`

Always inspect `index.html` before assuming a repository module is active.

## Key database domains
- clients / financial_profiles
- assets / liabilities / goals
- family_members
- insurance_policies
- health_assessments
- health_product_plans
- app_users
- admin_users
- product_catalog
- proposal_exports

## Important completed features
- persistent clients
- family insured persons
- policy portfolio
- private policy document upload
- browser OCR for image policy documents
- tax planning
- Health Planner and health product comparison
- administrator portal and customer drill-down
- client PDF planning report

## Current constraints
- Health product recommendations are limited by verified catalog data.
- OCR output must be reviewed by the advisor.
- Loader architecture still depends on a frozen historical HTML commit.
- Full SaaS billing/subscription automation is not yet implemented.
- App Store packaging is not implemented; current product is a web app.

## Recovery instruction for a new developer/AI
Start by reading, in order:
1. `README.md`
2. `docs/PROJECT_STATE.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DATABASE_SCHEMA.md`
5. the feature-specific document relevant to the requested change
6. current `index.html`
7. current production module files

Do not reconstruct product facts from chat memory. Read the database catalog and verified source documents.
