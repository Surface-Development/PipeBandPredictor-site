# PipeBandPredictor Marketing Site — Design Spec

**Date:** 2026-05-03
**Author:** Sean McMahon
**Status:** Draft — pending implementation plan

---

## 1. Goals

- Ship a dedicated marketing site at `pipebandpredictor.com` for the PipeBandPredictor mobile app.
- Establish that domain as the canonical home for app-store CTAs, legal documents, support, and (when re-enabled) league invite landing pages.
- Pull season schedule data live from the existing Sanity CMS so the homepage is always current without manual edits.
- Use the dedicated domain as the host for iOS Universal Links and Android App Links going forward, replacing the current `surfacedevelopment.co.uk/pipebandpredictor/invite/*` host.

## 2. Non-goals (v1)

- Dark mode.
- Live leaderboard or any feature that pulls from Supabase at runtime.
- A blog / news section (the chosen stack supports it; we just don't ship one yet).
- Internationalisation — English only.
- Cookie banner / consent UI (analytics choice avoids the need).
- Any change to the currently-installed app version's behaviour. Cutover is config-only and lands in a future app release.

## 3. Architecture overview

**Stack:** Eleventy (11ty) static site generator. Plain handcrafted CSS (design tokens + a small component layer) — no Tailwind, no JS framework. Vanilla JS for the handful of interactive bits (mobile nav, FAQ accordion, invite-landing logic).

**Hosting:** Cloudflare Pages, connected to the `PipeBandPredictor-site` GitHub repo. Build command `npm run build`, output `_site/`. Auto-deploys on push to `main`; per-PR preview deploys.

**DNS / domain:** `pipebandpredictor.com` transferred into Cloudflare for unified DNS + CDN management. Cloudflare auto-provisions the TLS cert and serves both apex and `www` (with `www → apex` 301 in `_redirects`).

**Why this stack:**
- 11ty outputs plain HTML — perfect match for static hosting; no framework treadmill.
- Multi-page chrome (header, footer, head/og partials) lives in single-source-of-truth includes.
- Cloudflare Pages is needed (over GitHub Pages) specifically because we must set `Content-Type: application/json` on the AASA file, which GitHub Pages cannot do without an HTTP-rewrite proxy in front.

## 4. Repository layout

```
PipeBandPredictor-site/
├── .eleventy.js
├── .nvmrc                          (Node 20, matches the app repo)
├── package.json
├── package-lock.json               (npm, per existing CLAUDE.md convention)
├── _headers                        (copied to _site as-is)
├── _redirects                      (copied to _site as-is)
├── docs/
│   └── superpowers/specs/          (this document and future plans)
├── src/
│   ├── _data/
│   │   ├── site.json               (URLs, contact, app store links, social)
│   │   ├── nav.json                (top-nav items)
│   │   ├── features.json           (homepage feature cards)
│   │   ├── faq.json                (Q/A pairs grouped by topic)
│   │   └── schedule.js             (build-time fetch from Sanity)
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk            (root: <html>, head, body, nav, footer)
│   │   │   └── page.njk            (extends base, single-column content)
│   │   └── partials/
│   │       ├── head.njk
│   │       ├── nav.njk
│   │       ├── footer.njk
│   │       ├── og.njk              (open graph + twitter card meta)
│   │       └── store-buttons.njk   (App Store + Play Store CTAs)
│   ├── assets/
│   │   ├── css/
│   │   │   ├── tokens.css
│   │   │   ├── base.css
│   │   │   └── components.css
│   │   ├── img/
│   │   │   ├── screenshots/        (reused from surfacedevelopment-site)
│   │   │   ├── og/                 (1200×630 OG images)
│   │   │   └── favicon set         (svg, ico, apple-touch)
│   │   └── js/
│   │       ├── nav.js              (mobile menu toggle)
│   │       ├── faq.js              (accordion)
│   │       ├── invite.js           (smart redirect logic)
│   │       └── analytics.js        (Cloudflare Web Analytics snippet, if not auto-injected)
│   ├── index.njk
│   ├── how-it-works.njk
│   ├── faq.njk
│   ├── support.njk
│   ├── privacy.njk
│   ├── terms.njk
│   ├── data-deletion.njk
│   ├── invite/
│   │   └── index.njk               (single template, serves all /invite/<code> via _redirects rewrite)
│   ├── .well-known/
│   │   ├── apple-app-site-association
│   │   └── assetlinks.json
│   ├── 404.njk
│   ├── robots.txt
│   └── sitemap.njk                 (or generated via plugin)
└── README.md
```

## 5. Site map and URL structure

| URL | Page | Notes |
|---|---|---|
| `/` | Landing | Hero, features, how-it-works teaser, scoring callout, screenshots, season schedule strip, download CTA, footer |
| `/how-it-works/` | How it works | 3-step walkthrough, scoring rules with worked examples, leagues subsection |
| `/faq/` | FAQ | Accordion grouped by topic |
| `/support/` | Support | Support email, bug-report guidance, links to legal & data-deletion |
| `/privacy/` | Privacy | Self-hosted; adapted from existing Surface page |
| `/terms/` | Terms of Service | Self-hosted |
| `/data-deletion/` | Data Deletion | Self-hosted |
| `/invite/<code>` | Invite landing | Smart redirect / "Get the app" page (rewritten to `/invite/index.html` via `_redirects`) |
| `/.well-known/apple-app-site-association` | iOS Universal Links manifest | Served as `application/json` via `_headers` |
| `/.well-known/assetlinks.json` | Android App Links manifest | Standard `.json` Content-Type |
| `/sitemap.xml` | Sitemap | All pages except `/invite/*` and `/.well-known/*` |
| `/robots.txt` | Robots | Allow all; reference sitemap |
| `/404.html` | Not found | Cloudflare Pages serves this on 404 |

**Top navigation:** Home · How it Works · FAQ · Support
**Footer:** brand blurb · Navigate (top-nav links) · Legal (Privacy / Terms / Data Deletion) · Contact (support email) · © Surface Development.

## 6. Visual design — tokens & treatment

Direction: "App-Native" (light surfaces, Poppins, blue + gold accents that mirror the in-app palette so the site reads as a marketing extension of the product).

### 6.1 Tokens (`src/assets/css/tokens.css`)

```css
:root {
  /* Brand — sourced from PipeBandPredictor/lib/colors.json */
  --color-primary:        #3C8CCA;   /* primary.500 */
  --color-primary-hover:  #2F7AB8;   /* primary.600 */
  --color-primary-deep:   #144571;   /* primary.800 */
  --color-primary-ink:    #0A2C4A;   /* primary.900 */
  --color-secondary:      #E8B923;   /* secondary.500 */
  --color-secondary-glow: #FACC15;   /* secondary.300 */

  /* Surfaces */
  --color-bg:             #FFFFFF;
  --color-surface:        #FAFBFD;
  --color-surface-2:      #F0F6FC;   /* hero gradient end */
  --color-border:         #E2E6EE;

  /* Text */
  --color-text:           #171717;
  --color-text-muted:     #525252;
  --color-text-subtle:    #737373;

  /* Typography */
  --font-sans: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --weight-regular: 400;
  --weight-medium:  500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Spacing — matches app spacing scale */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  12px;
  --space-lg:  16px;
  --space-xl:  24px;
  --space-2xl: 32px;
  --space-3xl: 48px;
  --space-4xl: 72px;
  --space-5xl: 96px;

  /* Radii */
  --radius-sm:   6px;
  --radius:      8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   20px;
  --radius-2xl:  24px;
  --radius-pill: 999px;

  /* Shadows — adapted from app shadow tokens */
  --shadow-card:        0 2px 8px 0 rgb(0 0 0 / 0.08);
  --shadow-card-hover:  0 4px 16px 0 rgb(0 0 0 / 0.12);
  --shadow-card-feat:   0 12px 32px -8px rgb(60 140 202 / 0.25), 0 4px 12px -2px rgb(0 0 0 / 0.10);
  --shadow-glow-primary: 0 0 20px 0 rgb(60 140 202 / 0.40), 0 4px 12px -2px rgb(60 140 202 / 0.25);
  --shadow-glow-secondary: 0 0 20px 0 rgb(232 185 35 / 0.40), 0 4px 12px -2px rgb(232 185 35 / 0.25);

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration: 0.25s;
}
```

### 6.2 Typography

- **Font:** Poppins (Google Fonts), weights `400, 500, 600, 700` only. Loaded via `<link rel="preconnect">` + a single `<link rel="stylesheet">` in `head.njk`. `font-display: swap`.
- **Scale (fluid):** `clamp()`-based for h1 / h2; fixed for h3 / body.
  - h1: `clamp(2rem, 1.4rem + 2.6vw, 3.5rem)`
  - h2: `clamp(1.5rem, 1.15rem + 1.4vw, 2.25rem)`
  - h3: `1.25rem` (semibold)
  - body: `1rem` (regular, line-height 1.6)
  - small / labels: `0.8125rem`
- **Headings** are `font-weight: 700`, body `400`.

### 6.3 Component patterns

- **Buttons:** primary (filled blue, gold-glow on hover), ghost (white with blue border + blue text), disabled (greyed for "Coming soon" Play Store CTA). Pill radius. ~44 px tall.
- **Feature card:** white surface, `--shadow-card`, icon top-left, h3 + 1-line description. Hover: `--shadow-card-hover` + 2 px lift.
- **Schedule chip:** rounded pill with date + event name; "Major" gold pill on the Worlds.
- **FAQ accordion:** native `<details>`/`<summary>` styled — no JS required for v1, progressive enhancement only if needed.

## 7. Page content outlines

Full copy is written during implementation; this section captures the structure and key messages.

### 7.1 `/` (Landing)

1. **Hero** — H1: "Predict the top 6." Subhead: "The prediction game for Grade 1 pipe band championships." App Store CTA + Play Store ("Coming soon"). Phone mockup or screenshot to the right.
2. **Features (4-card grid)** — Predictions / Leagues / Leaderboards / Seasons. Same structure as the existing Surface page.
3. **How it works teaser (3-step)** — Pick → Watch → Score. CTA: "See how scoring works → /how-it-works/".
4. **Scoring callout** — Gold-tinted band: 3 tiles (2 pts single-winner / 3 pts exact / 1 pt right-band-wrong-slot).
5. **Screenshots** — 3-up phone screenshots (Home / Predictions / Leagues). Reuse `surfacedevelopment-site/assets/screenshots/*.PNG`.
6. **Season schedule** — Horizontal scrolling strip of upcoming Grade 1 majors, populated from Sanity at build time. Each chip: event name + date. Worlds gets a gold "Major" pill. Empty-state copy if no upcoming rounds.
7. **Download CTA** — Larger CTA band with both store buttons.
8. **Footer**.

### 7.2 `/how-it-works/`

- **How predictions work** — Three-step walkthrough with screenshots. Picking, locking, results.
- **Scoring rules in detail** — Worked examples for both single-winner and multi-position prediction groups, including the 3 pts / 1 pt logic.
- **Leagues** — Creating, joining via 7-character code, league leaderboards. (Soft-hide or label as "Coming soon" until invites are re-enabled in the app.)
- **Upcoming events** — Same schedule data, presented as a list rather than strip.

### 7.3 `/faq/`

Accordion sections (one open at a time):
- **Scoring** — How are points awarded? What if there's a tie? When do scores update?
- **Leagues** — How do I create one? How do I join one? Can I leave?
- **Results** — Where do you get results from? How long after an event do scores update?
- **Account** — Sign-in options (Apple, Google, Facebook). How do I delete my account?
- **Platforms** — iOS available now. Android coming soon. Web?

### 7.4 `/support/`

Short page: support email (`support@surfacedevelopment.co.uk`), "Found a bug or want a feature?" prompt, links to Privacy / Terms / Data Deletion.

### 7.5 `/privacy/`, `/terms/`, `/data-deletion/`

Adapted from the existing Surface pages. Updated to reference `pipebandpredictor.com` URLs and Surface Development as data controller. Adjust app-store-listing privacy URLs in App Store Connect / Play Console once the new pages are live.

### 7.6 `/invite/<code>`

Covered in §9.

## 8. Sanity integration (build-time)

**Why build-time:** static output preferred (SEO, speed, no flicker). Content updates trigger automatic rebuilds via webhook, so editorial UX matches a normal CMS.

**Implementation:**
- Add `@sanity/client` to dev dependencies.
- `src/_data/schedule.js` exports an async function that:
  1. Reads `SANITY_PROJECT_ID` (`pipebandpredictor`), `SANITY_DATASET` (`production`), and `SANITY_READ_TOKEN` (only required if dataset is private) from `process.env`.
  2. Queries: `*[_type == "round" && eventDate >= now()] | order(eventDate asc) {_id, name, roundType, eventDate, predictionsOpenAt, predictionsCloseAt, "season": season->name}`.
  3. Returns an array consumable by Nunjucks templates.
  4. On fetch failure (network, auth), returns `[]` and logs — the build does not fail, the schedule strip simply renders its empty state.
- `npm run build` invokes 11ty which evaluates the data file and bakes the schedule into HTML.
- `.env.example` lists the three env vars; production values live in Cloudflare Pages → Project → Settings → Environment Variables (Build).

**Auto-rebuild on content change:**
- Cloudflare Pages → Settings → Builds & deployments → "Deploy hooks" — create a hook URL.
- Sanity → API → Webhooks — create a new webhook: filter `_type == "round"`, trigger on create/update/delete, paste the deploy hook URL. (Optionally also add a webhook for `_type == "season"` if season metadata is referenced.)

**Branch deploys for staging:** Cloudflare Pages can map a non-`main` branch (e.g. `staging`) to the `pipebandpredictor-dev` Sanity dataset by setting different env vars on the staging branch. Optional, ship later.

## 9. Universal Links + invite landing

### 9.1 AASA file (`src/.well-known/apple-app-site-association`)

```json
{
  "applinks": {
    "details": [
      {
        "appID": "2DGK7F9D85.com.surfacedevelopment.pipebandpredictor",
        "paths": ["/invite/*"]
      }
    ]
  }
}
```

`_headers` rule:

```
/.well-known/apple-app-site-association
  Content-Type: application/json
```

### 9.2 assetlinks.json (`src/.well-known/assetlinks.json`)

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.pipebandpredictor.app",
      "sha256_cert_fingerprints": [
        "<UPLOAD_KEY_SHA256_TO_BE_PROVIDED>",
        "<APP_SIGNING_KEY_SHA256_TO_BE_PROVIDED>"
      ]
    }
  }
]
```

The `.json` extension means the standard `application/json` Content-Type is served without further config. Fingerprints come from Play Console → App signing.

### 9.3 Invite landing page

`src/invite/index.njk` — single template serving every `/invite/<code>` URL via the `_redirects` rewrite below. This template is only rendered when iOS/Android does *not* hand the URL to the app (i.e. app not installed). When the app is installed and Universal-Link / App-Link verification has succeeded, the OS opens the app directly without loading this page.

`_redirects`:

```
/invite/* /invite/index.html 200
```

Behaviour:
1. JS reads `window.location.pathname`, extracts the trailing path segment as the code.
2. Validates the code matches the expected 7-character format. On invalid or missing: render the generic "Get PipeBandPredictor" landing without code-specific copy. (Exact regex confirmed during implementation against the app's invite-code spec.)
3. Detects platform via `navigator.userAgent`:
   - iOS → prominent App Store CTA.
   - Android → prominent Play Store CTA (greyed/labelled "Coming soon" until the listing goes live).
   - Other → both CTAs.
4. Renders the code in a copy-to-clipboard pill so the user can paste it after installing the app.
5. Optional progressive enhancement: after a 500 ms delay, attempt `pipebandpredictor://invite/<code>` (custom scheme) as a backup for older Android builds where App-Links auto-verification didn't complete. Disabled by default — enable only if needed.

### 9.4 App config update (deferred PR in the app repo)

When invites are re-enabled, the PipeBandPredictor app needs:

```diff
"ios": {
-  "associatedDomains": ["applinks:surfacedevelopment.co.uk"]
+  "associatedDomains": ["applinks:pipebandpredictor.com"]
},
"android": {
  "intentFilters": [{
    "action": "VIEW", "autoVerify": true,
    "data": [{
      "scheme": "https",
-     "host": "surfacedevelopment.co.uk",
-     "pathPrefix": "/pipebandpredictor/invite/"
+     "host": "pipebandpredictor.com",
+     "pathPrefix": "/invite/"
    }],
    "category": ["BROWSABLE", "DEFAULT"]
  }]
}
```

Plus EAS env var: `EXPO_PUBLIC_INVITE_BASE_URL=https://pipebandpredictor.com/invite`.

Since invites are currently a commented-out feature and the app is newly launched, no live URLs depend on the old host — no legacy redirects required.

## 10. Build & deploy pipeline

**Local development:**
- `npm install`
- `npm run dev` — `eleventy --serve` with hot reload on `localhost:8080`
- `.env` (gitignored) for local Sanity credentials

**Production build:**
- `npm run build` — `eleventy` → `_site/`
- `_headers` and `_redirects` are configured as Eleventy passthrough copy targets in `.eleventy.js` so they land at the root of `_site/`. Cloudflare Pages reads them from there.

**Cloudflare Pages config:**
- Build command: `npm run build`
- Build output directory: `_site`
- Node version: 20
- Environment variables (Build, Production):
  - `SANITY_PROJECT_ID=pipebandpredictor`
  - `SANITY_DATASET=production`
  - `SANITY_READ_TOKEN=<token if dataset private>`
- Preview deployments: on for all branches/PRs.
- Custom domains: `pipebandpredictor.com` (primary), `www.pipebandpredictor.com` (redirected to apex via `_redirects`).

**Git workflow:**
- `main` branch → production deploys.
- Feature branches → preview URLs per PR.
- Sanity webhook hits the production deploy hook on content change.

## 11. Analytics & SEO

**Analytics — Cloudflare Web Analytics:**
- Enabled on the Cloudflare Pages project. Cookieless, no PII, no consent banner needed (GDPR/UK GDPR compliant).
- Auto-injected via Pages settings (preferred) or pasted manually in `head.njk`.

**SEO baseline:**
- Per-page `<title>`, `<meta name="description">`, canonical URL, theme-color (`#3C8CCA`).
- `og.njk` partial sets Open Graph + Twitter Card meta. OG image: 1200×630 PNG. v1 reuses `og-pipe-band-predictor.png` from the Surface site; can be replaced with a domain-specific asset later.
- JSON-LD `SoftwareApplication` on `/`, mirroring the existing Surface page schema but with updated `url` and `installUrl`.
- JSON-LD `BreadcrumbList` on inner pages.
- `sitemap.xml` (auto-generated via `@quasibit/eleventy-plugin-sitemap` or hand-rolled `sitemap.njk`) — excludes `/invite/*` and `/.well-known/*`.
- `robots.txt`: `Allow: /` plus sitemap reference.
- Security headers via `_headers` (apply to all paths):
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: interest-cohort=()`
  - Basic CSP scoped to self + Cloudflare Insights + Google Fonts.

## 12. Out of scope (v1)

- Dark mode.
- Live leaderboard / any Supabase-backed widget.
- Blog or news section.
- Internationalisation.
- Cookie banner.
- A/B testing.
- Server-rendered or interactive features beyond the small JS bits described.

## 13. Dependencies / handoffs

| # | Owner | Item | Where |
|---|---|---|---|
| 1 | User | Transfer `pipebandpredictor.com` into Cloudflare (registrar transfer) | Cloudflare Registrar |
| 2 | User | Create Cloudflare Pages project + connect to `PipeBandPredictor-site` GitHub repo | Cloudflare dashboard |
| 3 | User | (If Sanity production dataset is private) generate read-only token; add as Cloudflare Pages env var | Sanity → API → Tokens |
| 4 | User | Create Sanity webhook on `_type == "round"` → Cloudflare Pages deploy hook | Sanity → API → Webhooks |
| 5 | User | Provide Android upload-key + app-signing-key SHA-256 fingerprints | Play Console → App signing |
| 6 | User | Once Play Store listing is live, share the URL | n/a |
| 7 | User (later) | When invites are re-enabled, merge the app config PR for `applinks:pipebandpredictor.com` and rebuild app | PipeBandPredictor repo |
| 8 | User | Update App Store Connect + Play Console privacy/terms URLs to the new self-hosted versions once live | App Store Connect / Play Console |

## 14. Cutover sequence

1. **Phase 1 — Site live.** Deploy `pipebandpredictor.com` with all pages, AASA, assetlinks. Validate with Apple's AASA tool and Google's Digital Asset Links tester. Update App Store Connect privacy/terms URLs.
2. **Phase 2 — App config (deferred).** When invites are re-enabled in the app, the corresponding PR in the `PipeBandPredictor` repo updates `associatedDomains`, `intentFilters`, and `EXPO_PUBLIC_INVITE_BASE_URL`. New EAS build, normal release. No coordinated rollout needed because there are no live URLs in the wild today.

## 15. Risks & open questions

- **Apple's AASA fetch caching.** Apple's CDN caches AASA aggressively. After deploy, validation can take 24 h to settle. Plan: validate via `https://app-site-association.cdn-apple.com/a/v1/pipebandpredictor.com` after Phase 1.
- **Sanity dataset visibility.** If the production dataset is public-readable, no token is needed. If private, env var must be set on Cloudflare Pages. Confirm during implementation.
- **Schedule data shape.** Exact GROQ projection may need tweaking once we see real data; a smoke test in dev is part of the implementation plan.
- **OG image branding.** Reusing the Surface-branded OG asset for v1; a dedicated PipeBandPredictor OG image is a quick follow-up but not blocking.
- **Play Store listing URL.** "Coming soon" placeholder until the listing is approved; CTA copy and link swap is a small follow-up PR.
