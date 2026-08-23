# AIA Financial Planner

A web-based financial and insurance planning system for advisors. The application combines client records, financial profiles, insurance portfolios, health-insurance gap analysis, product recommendations, OCR-assisted policy capture, admin controls, and downloadable client PDF reports.

## Production entry points

- Main app: https://zick2526-ai.github.io/AIA-financial-planer/
- Admin portal: https://zick2526-ai.github.io/AIA-financial-planer/admin.html
- Repository: `zick2526-ai/AIA-financial-planer`
- Default branch: `main`
- Backend: Supabase project `tlmbwvtxsxdlxkcmropp`

## Source of truth

1. **GitHub** is the source of truth for application code and project documentation.
2. **Supabase** is the source of truth for runtime data, Auth, RLS, Storage and Edge Functions.
3. Changes to database structure should be represented by Supabase migrations.
4. Product data used for recommendations must be based on verified source documents. Do not guess product benefits, eligibility or premiums.

## Key modules

- `index.html` — loader for the current application shell and add-on modules.
- `policy-scanner.js` — image OCR and policy-field assistance.
- `health-planner.js` / `health-planner-v2.js` — health-insurance gap analysis and product comparison.
- `report-generator.js` — multi-page client PDF report generator.
- `admin.html`, `admin.js`, `admin-launcher.js` — administrator console and access launcher.
- `db-bridge.js` — database client bridge for add-on modules.
- `v22-auth.js` — authentication UI/flow.
- `v23-tax.js` — tax-planning module.
- `v25-client-management.js` — client management.

## Documentation

- [Project overview](docs/PROJECT_OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE_SCHEMA.md)
- [Admin system](docs/ADMIN_SYSTEM.md)
- [Health Planner](docs/HEALTH_PLANNER.md)
- [Product Catalog](docs/PRODUCT_CATALOG.md)
- [PDF report](docs/PDF_REPORT.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Backup & restore](docs/BACKUP_RESTORE.md)
- [Change log](CHANGELOG.md)

## Recovery principle

The project must be recoverable without access to the original ChatGPT conversation. A new developer or AI agent should be able to start from this repository, read the documentation, connect to the Supabase project with authorized credentials, and understand the current production architecture.

## Security rules

- Never place a Supabase `service_role` key in browser JavaScript or this public repository.
- Browser code may use only the project publishable/anon key as designed.
- Keep RLS enabled for exposed tables.
- Admin-only operations must remain server-side and validate admin membership.
- Customer and policy data are sensitive; use least-privilege access.

## Current product direction

The application is designed to evolve into a subscription SaaS for individual advisors (Pro) and teams (Team), while remaining deployable as a web app without relying on an app store.
