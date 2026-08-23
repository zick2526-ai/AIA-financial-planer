# Architecture

## High-level architecture

```text
Browser / Mobile Browser
        |
        v
GitHub Pages
  index.html loader
        |
        +--> Core app modules
        +--> policy-scanner.js
        +--> health-planner*.js
        +--> report-generator.js
        +--> admin-launcher.js
        |
        v
Supabase
  Auth
  Postgres + RLS
  Storage
  Edge Functions
```

## Front end

The project currently uses a loader-based architecture. `index.html` loads a frozen application shell and injects current add-on modules. This lets newer modules evolve without rebuilding the entire historic application in one step.

Important consequence: when refactoring, verify which module is actually loaded by `index.html`; the presence of a file in the repository does not guarantee it is active.

## Data access

Browser modules use a Supabase client exposed through one of the application bridge globals. `db-bridge.js` exists to make add-on modules compatible with the current shell.

All customer-facing browser queries must continue to rely on RLS. Do not bypass RLS in client-side code.

## Authentication

Supabase Auth provides user sessions. Advisor ownership is represented in client/data records and enforced by RLS where applicable.

## Admin architecture

Admin UI is hosted at `admin.html`. Browser code authenticates normally, then calls the `admin-console` Edge Function. The function verifies the caller is present in `admin_users` before using privileged server-side access.

The service-role credential must exist only in the server/Edge Function environment.

## Storage

Policy source documents are stored in the private `policy-documents` bucket. Application access should use authenticated storage policies and short-lived signed URLs for viewing.

## OCR

`policy-scanner.js` performs browser-side OCR for image uploads using Tesseract.js. It preprocesses the image, recognises Thai/English text and fills candidate policy fields. The advisor must verify all OCR output.

## Health analysis

Health Planner loads:
- client profile
- existing policies
- latest saved health assessment
- active `health_product_plans`

It computes coverage gaps and ranks product records using structured criteria. The catalog, not free-form AI guessing, is the source for product facts.

## PDF reports

`report-generator.js` builds an off-screen A4 HTML report, renders pages to canvas and writes those page images into a PDF. This approach preserves Thai rendering and dashboard visuals without embedding custom font files.

## Known architectural debt

- Loader still depends on a frozen historical application commit.
- Some functionality is split across versioned add-on JavaScript files.
- Production should eventually move to a conventional source tree/build pipeline (for example Next.js/Vite) with environment variables, tests and CI/CD.

Until that migration, preserve the loader contract carefully.
