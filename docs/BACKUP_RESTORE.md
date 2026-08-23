# Backup & Restore

## Goal

The project must be recoverable even if the original ChatGPT conversation, a local device, or one deployment environment is unavailable.

## What must be preserved

### 1. Source code and documentation
Primary location: GitHub repository `zick2526-ai/AIA-financial-planer`.

Minimum protection:
- keep all production changes committed
- avoid keeping unique code only in chat messages or local files
- keep `main` as the known production branch
- create tagged releases/checkpoints before major commercial changes

Recommended additional protection:
- periodic repository ZIP/export
- optional second private mirror repository

### 2. Database structure
Supabase migrations are the authoritative schema-change history.

For every material DDL change:
- create a named migration
- do not rely only on manually executed SQL with no record
- document major logical changes in `DATABASE_SCHEMA.md`

### 3. Production data
Customer records, financial data, policies and assessments live in Supabase Postgres.

Before commercial production, implement a scheduled database backup policy suitable for the subscription plan and sensitivity of the data. Test restoration, not only backup creation.

### 4. Storage objects
Policy source files live in the private `policy-documents` bucket. Database backups do not necessarily replace a separate storage-object backup strategy. Preserve important uploaded policy documents according to business retention/PDPA rules.

### 5. Auth and configuration
Document configuration, but **never commit secrets**.

Preserve securely outside the public repository:
- project ownership/access
- DNS/domain credentials if a custom domain is added
- billing account access
- secret API/service-role credentials

Publishable browser keys may be present where technically required, but privileged keys must never be committed.

## Recovery order

If the application must be rebuilt:

1. Recover/clone the GitHub repository.
2. Read `README.md` and `/docs`.
3. Confirm the Supabase project is available.
4. If rebuilding Supabase, recreate schema from migrations in order.
5. Restore database data from the chosen backup.
6. Restore Storage objects/bucket policies.
7. Restore/deploy Edge Functions and server-side secrets.
8. Configure front-end Supabase endpoint/publishable key.
9. Deploy GitHub Pages.
10. Test authentication, RLS, client access, policy upload, Health Planner, PDF export and Admin.

## Disaster-recovery test checklist

At least periodically verify that an authorised person can answer:
- Where is the production source code?
- What commit/release is running?
- Which Supabase project is production?
- Where are database backups?
- Can a backup actually be restored?
- Are policy-document objects also protected?
- Can Admin be recovered without exposing service-role credentials?
- Is there documentation sufficient to continue without the original chat?

## Privacy

Backups contain sensitive customer data. Encrypt and restrict access. Retention and deletion procedures should align with applicable Thai PDPA obligations and the business's approved data-retention policy.
