# Admin System

## Entry point

`admin.html` provides the administrator portal. `admin-launcher.js` conditionally displays an Admin shortcut in the main application for authorised admins.

## Authorization model

Admin access is not based on a client-side role flag alone.

1. User signs in through Supabase Auth.
2. Admin page obtains the authenticated session/JWT.
3. Browser invokes the Supabase Edge Function `admin-console`.
4. `admin-console` verifies the caller against `public.admin_users`.
5. Only after verification does the function perform privileged server-side operations.

## Edge Function

Function slug: `admin-console`.

Important actions currently include:
- `status` — confirm admin access
- `overview` — admin dashboard statistics/user data
- `set_admin` — change admin membership
- `set_disabled` — enable/disable application user access
- `user_clients` — read clients belonging to a selected advisor/user
- `client_detail` — read detailed client planning information for admin review

## Customer drill-down

The Admin UI can open an advisor's client list and inspect a selected customer. The intended client-detail experience is read-only for customer planning data. Existing admin account-management actions are separate.

## Security rules

- Never expose the service-role key in `admin.js`, `admin.html`, GitHub Pages or public repository history.
- Keep JWT verification enabled on the Edge Function.
- Every privileged action must re-check admin membership server-side.
- Avoid trusting browser-supplied role names.
- Prefer read-only access for customer drill-down unless a clearly designed write workflow is later approved.

## Operational check after admin changes

1. Sign in as a known normal advisor and verify Admin shortcut is absent / privileged calls are rejected.
2. Sign in as an authorised admin and verify dashboard loads.
3. Test client drill-down.
4. Review Edge Function logs for errors.
5. Re-run the security advisor if database/RLS permissions were changed.
