# Database Schema

Backend project: Supabase `tlmbwvtxsxdlxkcmropp`.

This document records the logical model. Supabase migrations remain the authoritative history of schema changes.

## Core customer tables

### `clients`
Primary client record. Important fields include `advisor_id`, `full_name`, `nickname`, `phone`, `email`, `birth_date`, `occupation`, `marital_status`, `dependents`, `notes`.

### `financial_profiles`
One client financial profile. Includes income, expenses, debt payments, emergency cash, assets/liabilities totals, existing life/health/CI cover, retirement information, risk level, plus `planner_data` and `tax_data` JSON.

### `assets`
Client assets: category, description, amount.

### `liabilities`
Client liabilities: category, description, outstanding balance, monthly payment.

### `goals`
Client financial goals: type/name, target amount/date, priority, notes.

### `family_members`
People attached to a client household. Policies may refer to `insured_member_id`.

## Insurance tables

### `insurance_policies`
Existing policy portfolio. Important fields:
- insurer
- product_name
- policy_type
- policy_number
- insured_name / insured_member_id
- sum_assured
- annual_premium
- health_limit
- ci_limit
- policy_status
- start_age
- term_years
- pay_years
- annual_cashback
- maturity_benefit
- yearly_data JSON
- source_file_name / source_file_path

### `health_assessments`
Saved Health Planner input/output per client/advisor. Includes annual budget, employer benefits, target room cost, target annual limit, deductible preference, OPD/Cancer/CI preferences, hospital preference, insured sex and saved `analysis` JSON.

### `health_product_plans`
Verified health product catalog. Important fields:
- product_name / plan_name / provider
- min_age / max_age
- room_limit / annual_limit
- deductible / OPD / cancer / CI limits
- premium range fields
- hospital tier
- suitable_for / key_reasons / caution
- source metadata and `extra` JSON
- active flag and sort order

Catalog entries should contain source provenance and must not be populated from guesses.

## Commercial / user administration

### `app_users`
Application membership record, including role, subscription plan and status.

### `admin_users`
Explicit admin membership. Used by the server-side admin console authorization layer.

### `product_catalog`
General product library created for commercial/product recommendation use.

### `proposal_exports`
Tracks proposal/report exports when used by the application.

## Supporting tables

The project also contains supporting tables for recommendations, advisor notes, history/intake flows and other planning features created by earlier migrations.

## Storage

Private bucket: `policy-documents`.

Expected object path pattern:
`<user-id>/<client-id>/<timestamp>-<safe-file-name>`

## Security requirements

- RLS must remain enabled on tables exposed through the Data API.
- Advisor-owned customer rows must not be readable by unrelated users.
- Browser code must never use a service-role key.
- Admin privileged queries belong in Edge Functions with admin verification.

## Migration discipline

For every future DDL change:
1. Use a named Supabase migration.
2. Verify the schema after migration.
3. Run Supabase Security Advisor after security-sensitive changes.
4. Update this document when the logical model changes materially.
