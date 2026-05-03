# pipebandpredictor.com

Marketing site for the [PipeBandPredictor](https://apps.apple.com/gb/app/pipe-band-predictor/id6758277252) mobile app. Static site built with Eleventy, deployed on Cloudflare Pages.

## Quick start

```bash
nvm use            # Node 20
npm install
cp .env.example .env   # optional: fill in Sanity creds for live schedule data
npm run dev        # http://localhost:8080
```

## Scripts

- `npm run dev` — Eleventy dev server with hot reload.
- `npm run build` — production build to `_site/`.
- `npm test` — Vitest suite (build smoke + unit tests).
- `npm run format` — Prettier across the repo.

## Environment variables (build-time)

| Var | Purpose | Required? |
|---|---|---|
| `SANITY_PROJECT_ID` | Sanity project id (`pipebandpredictor` for production) | Optional — without it, schedule renders empty-state |
| `SANITY_DATASET` | Sanity dataset (`production`) | Optional |
| `SANITY_READ_TOKEN` | Sanity read-only token | Only if dataset is private |

## Deploying to Cloudflare Pages

One-time setup:

1. **Domain.** Transfer `pipebandpredictor.com` into Cloudflare (Registrar → Transfer Domains). DNS is managed automatically once the transfer completes.
2. **Pages project.** Cloudflare dashboard → Pages → Create project → Connect to GitHub → select `PipeBandPredictor-site`.
   - Build command: `npm run build`
   - Build output directory: `_site`
   - Node version: `20`
   - Root directory: `/`
3. **Environment variables.** Settings → Environment variables → add `SANITY_PROJECT_ID`, `SANITY_DATASET`, and (if needed) `SANITY_READ_TOKEN` to **Production**.
4. **Custom domain.** Settings → Custom domains → add `pipebandpredictor.com`. Cloudflare provisions the cert automatically. The `www` redirect is handled by `_redirects`.
5. **Web Analytics.** Cloudflare Pages project → Web Analytics → enable. Auto-injection adds the beacon to every page; no code change required.

## Sanity webhook for auto-rebuild

Settings → Builds & deployments → **Deploy hooks** → create a hook named "Sanity content change". Copy the URL.

In Sanity (Manage → API → Webhooks), create a webhook:
- **Trigger on:** Create, Update, Delete
- **Filter:** `_type == "round"`
- **URL:** the Pages deploy hook URL above
- **HTTP method:** POST

Now any round edited in Sanity Studio rebuilds the site automatically.

## Universal Links / App Links

The site hosts:
- `/.well-known/apple-app-site-association` — declares paths claimed by the iOS app.
- `/.well-known/assetlinks.json` — declares the Android app fingerprint.

**Before launch:** populate the `sha256_cert_fingerprints` in `src/.well-known/assetlinks.json` with the Android upload-key and app-signing-key fingerprints from Play Console → App signing.

After deploy, validate:
- iOS: https://search.developer.apple.com/appsearch-validation-tool/ (enter `pipebandpredictor.com`)
- Android: https://developers.google.com/digital-asset-links/tools/generator

## Pre-launch content review

The legal pages (`privacy`, `terms`, `data-deletion`) ship with a sensible structure but the copy needs a final pass before launch. Treat the dated "Last updated" field as authoritative once content is finalised.

## Project structure

See `docs/superpowers/specs/2026-05-03-pipebandpredictor-marketing-site-design.md` for the full design spec, and `docs/superpowers/plans/2026-05-03-pipebandpredictor-marketing-site.md` for the implementation plan.
