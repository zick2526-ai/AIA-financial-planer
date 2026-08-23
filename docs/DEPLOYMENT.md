# Deployment

## Front end

The production web application is served by GitHub Pages from the repository `zick2526-ai/AIA-financial-planer`, default branch `main`.

Production URL:
`https://zick2526-ai.github.io/AIA-financial-planer/`

Admin URL:
`https://zick2526-ai.github.io/AIA-financial-planer/admin.html`

## Current loader model

`index.html` is the production loader. It fetches a frozen historical application HTML and injects current add-on scripts before writing the page.

Because of this architecture, every deployment must verify:
1. the add-on file exists on `main`
2. `index.html` references it
3. the cache-busting query/version was updated when needed
4. GitHub Pages has served the new commit

## Normal front-end release procedure

1. Modify/create the module on `main` or a feature branch.
2. If changing an existing script, review current file SHA before update.
3. Update `index.html` if a new module must be loaded.
4. Commit with a descriptive message.
5. Open the public GitHub Pages URL and hard-refresh.
6. Test sign-in, client selection and the changed workflow on mobile and desktop where relevant.

## Supabase deployment

Supabase project ref: `tlmbwvtxsxdlxkcmropp`.

Database changes:
- use named migrations
- verify the resulting schema/data
- run security advisor for RLS/security changes

Edge Functions:
- deploy server-side functions through Supabase tooling
- keep JWT verification appropriate to the function
- keep service-role secrets server-side

## Production smoke test

After a release, minimally test:
- login/logout
- client list and client open
- policy portfolio
- file/photo upload where changed
- Health Planner
- PDF export
- Admin login and admin authorization if admin code changed

## Rollback

Front-end rollback:
- identify the last known-good Git commit
- restore affected files or revert the faulty commit
- verify GitHub Pages

Database rollback:
- never improvise destructive production rollback
- inspect migration history and data impact
- restore from backup or apply a deliberate corrective migration

## Long-term recommendation

Migrate from the frozen-loader architecture to a standard application build/deployment pipeline with environment variables, automated tests and CI/CD. Until then, the current loader is production-critical and should not be casually rewritten.
