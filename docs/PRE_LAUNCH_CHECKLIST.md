# Pre-launch checklist

Run through this before flipping `pipebandpredictor.com` to point at the production Cloudflare Pages deployment.

## Code / content

- [ ] Legal copy reviewed (Privacy, Terms, Data Deletion) and "Last updated" dates set to launch date.
- [ ] Screenshots in `src/assets/img/screenshots/` reflect the current app UI (not a stale build).
- [ ] OG image at `src/assets/img/og/pipe-band-predictor.png` exists (1200×630 PNG). Falls back to Surface OG if missing.
- [ ] Favicon set in `src/assets/img/icons/` (favicon.svg + apple-touch-icon.png).
- [ ] `src/.well-known/assetlinks.json` has real Android SHA-256 fingerprints (not the `REPLACE_WITH_*` placeholders).

## Cloudflare Pages

- [ ] `pipebandpredictor.com` transferred into Cloudflare and DNS propagated.
- [ ] Pages project connected to GitHub, building from `main`.
- [ ] Environment variables set: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_READ_TOKEN` (if required).
- [ ] Custom domain added; cert provisioned.
- [ ] `www` redirects to apex (test by curling `https://www.pipebandpredictor.com/`).
- [ ] Cloudflare Web Analytics enabled on the project.

## Sanity webhook

- [ ] Pages deploy hook URL created.
- [ ] Sanity webhook created on `_type == "round"` create/update/delete pointing at the deploy hook.
- [ ] Test by editing a round in Sanity Studio — confirm a new deployment fires within ~30s.

## Universal Links / App Links validation

- [ ] iOS AASA validator passes: https://search.developer.apple.com/appsearch-validation-tool/
- [ ] Android Digital Asset Links validator passes: https://developers.google.com/digital-asset-links/tools/generator
- [ ] (When invites are re-enabled in the app) `EXPO_PUBLIC_INVITE_BASE_URL=https://pipebandpredictor.com/invite` set in EAS env vars.
- [ ] (When invites are re-enabled) App config updated: `applinks:pipebandpredictor.com` in iOS, `host: pipebandpredictor.com` + `pathPrefix: /invite/` in Android intent filter.

## Store listings

- [ ] App Store Connect privacy policy URL → `https://pipebandpredictor.com/privacy/`.
- [ ] App Store Connect support URL → `https://pipebandpredictor.com/support/`.
- [ ] Play Console (when listing is live) privacy/support URLs updated.

## Smoke tests in production

- [ ] Visit each page from the top nav and footer; every link resolves with HTTP 200.
- [ ] `curl -I https://pipebandpredictor.com/.well-known/apple-app-site-association | grep -i content-type` shows `application/json`.
- [ ] `curl https://pipebandpredictor.com/invite/ABC1234` returns the invite landing HTML, and the page shows `ABC1234` after JS runs.
- [ ] Open `https://pipebandpredictor.com/` on iPhone with the app installed → URL stays in browser (universal links only fire for `/invite/*`, not the homepage).
- [ ] (Once invites and app update are live) tap a generated invite link from the app → app opens directly.
