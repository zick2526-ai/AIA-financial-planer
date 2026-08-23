# Change Log

This file captures important project-level changes. Git history remains authoritative for exact commits.

## 2026-08-23

### Project preservation
- Added permanent project documentation and recovery guidance.
- Established GitHub as the source of truth for code/documentation and Supabase as the runtime data/backend source of truth.

### Client PDF report
- Added downloadable multi-page client planning PDF report.
- Report includes overall insurance planning summary, Health Planner gap/recommendations, premium-payment dashboard/chart, policy table and additional planning information.

### Health Planner
- Added Health Planner / AIA analysis module.
- Added `health_assessments` and `health_product_plans` data model.
- Added health coverage gap analysis and product-comparison table.
- Added verified AIA Health CI Hero plan variants and structured co-pay information based on source documents.
- Added initial AIA Health Happy catalog data only where source evidence was available.

### Admin
- Added separate administrator portal.
- Added `admin_users` authorization layer.
- Added `admin-console` Supabase Edge Function with server-side admin verification.
- Added read-only customer drill-down for administrators.

### Policy portfolio / OCR
- Added family-member support for insured persons.
- Added policy document storage support using private Supabase Storage.
- Added browser OCR for policy images with Thai/English recognition and assisted form filling.

### Security
- Restricted privileged RPC permissions.
- Hardened RLS/security policies.
- Added proposal export indexes.
- Remaining leaked-password protection warning is dependent on Supabase plan capability and is not an application-code defect.

## Earlier development

Earlier versions established the financial planner shell, client management, authentication, tax planning, policy portfolio, commercial membership structures and other planning features. Refer to Git history and Supabase migration history for exact chronology.
