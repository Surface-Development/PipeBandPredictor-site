# PipeBandPredictor Marketing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `pipebandpredictor.com` — a multi-page marketing site for the PipeBandPredictor mobile app — built with Eleventy, deployed on Cloudflare Pages, with a Sanity-driven season schedule, self-hosted legal pages, and pre-wired iOS/Android universal-link infrastructure for the invite feature.

**Architecture:** Static site generator (Eleventy 3 / ESM) outputting plain HTML. Hand-written CSS using design tokens that mirror the app's `colors.json` (blue + gold, light surfaces, Poppins). Build-time fetch from Sanity CMS for season schedule data. Deployed via Cloudflare Pages with `_headers` controlling the AASA Content-Type and `_redirects` rewriting `/invite/<code>` to a single landing template.

**Tech Stack:** Node 20 · Eleventy 3 · Nunjucks · `@sanity/client` (build-time only) · Vitest (tests) · Cloudflare Pages (hosting) · Cloudflare Web Analytics (tracking).

---

## File Structure

```
PipeBandPredictor-site/
├── .eleventy.js                  Eleventy config (ESM)
├── .gitignore                    (exists)
├── .nvmrc                        Node 20
├── .prettierrc                   Match app repo formatter
├── README.md                     Run/build/deploy docs
├── _headers                      AASA Content-Type + security headers
├── _redirects                    /invite/* rewrite + www→apex
├── package.json                  npm scripts + deps
├── vitest.config.js              Test runner config
├── src/
│   ├── _data/
│   │   ├── site.json             Domain, store URLs, contact
│   │   ├── nav.json              Top nav links
│   │   ├── features.json         Homepage feature cards
│   │   ├── faq.json              FAQ Q/A grouped by topic
│   │   └── schedule.js           Build-time Sanity fetch
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk          <html>, head, nav, body, footer
│   │   │   └── page.njk          extends base, single-column content
│   │   └── partials/
│   │       ├── head.njk          meta, fonts, CSS
│   │       ├── og.njk            Open Graph + Twitter Card
│   │       ├── nav.njk           Top navigation
│   │       ├── footer.njk        Footer
│   │       └── store-buttons.njk App + Play store CTAs
│   ├── assets/
│   │   ├── css/
│   │   │   ├── tokens.css        Design tokens (CSS custom props)
│   │   │   ├── base.css          Reset + typography + layout primitives
│   │   │   └── components.css    Buttons, cards, accordion, hero, etc.
│   │   ├── img/
│   │   │   ├── screenshots/      Reused from surfacedevelopment-site
│   │   │   ├── og/               1200×630 OG images
│   │   │   ├── icons/            Favicon set
│   │   │   └── logo.svg          Inline-able logo
│   │   └── js/
│   │       ├── nav.js            Mobile menu toggle
│   │       └── invite.js         Smart redirect logic
│   ├── invite/
│   │   └── index.njk             /invite/<code> landing template
│   ├── .well-known/
│   │   ├── apple-app-site-association
│   │   └── assetlinks.json
│   ├── index.njk
│   ├── how-it-works.njk
│   ├── faq.njk
│   ├── support.njk
│   ├── privacy.njk
│   ├── terms.njk
│   ├── data-deletion.njk
│   ├── 404.njk
│   ├── sitemap.njk
│   └── robots.txt
└── tests/
    ├── schedule.test.js          Mocked Sanity fetch
    ├── invite.test.js            Code extraction + platform detection
    └── build.test.js             Build smoke test
```

---

## Task 1: Bootstrap project (package.json, scripts, Node version)

**Files:**
- Create: `package.json`
- Create: `.nvmrc`
- Create: `.prettierrc`
- Modify: `.gitignore` (already contains `.superpowers/` and `.DS_Store`; append node_modules + build output)

- [ ] **Step 1: Append node artifacts to `.gitignore`**

Read the current `.gitignore`, then append:

```
node_modules/
_site/
.env
.env.local
*.log
```

- [ ] **Step 2: Create `.nvmrc`**

```
20
```

- [ ] **Step 3: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

- [ ] **Step 4: Create `package.json`**

```json
{
  "name": "pipebandpredictor-site",
  "version": "0.1.0",
  "description": "Marketing site for PipeBandPredictor (pipebandpredictor.com)",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "eleventy --serve --quiet",
    "build": "eleventy",
    "clean": "rm -rf _site",
    "test": "vitest run",
    "test:watch": "vitest",
    "format": "prettier --write \"**/*.{js,njk,json,md,css}\"",
    "format:check": "prettier --check \"**/*.{js,njk,json,md,css}\""
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0",
    "@quasibit/eleventy-plugin-sitemap": "^2.2.0",
    "@sanity/client": "^6.21.0",
    "happy-dom": "^15.0.0",
    "prettier": "^3.3.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` written, no errors.

- [ ] **Step 6: Verify Node version**

Run: `node --version`
Expected: `v20.x.x` (or higher).

- [ ] **Step 7: Commit**

```bash
git add .gitignore .nvmrc .prettierrc package.json package-lock.json
git commit -m "chore: bootstrap eleventy project with npm scripts and dev dependencies"
```

---

## Task 2: Eleventy config + first build smoke test (TDD)

**Files:**
- Create: `tests/build.test.js`
- Create: `vitest.config.js`
- Create: `.eleventy.js`
- Create: `src/index.njk` (placeholder)

- [ ] **Step 1: Write failing build smoke test**

Create `tests/build.test.js`:

```js
import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

describe('Eleventy build', () => {
  beforeAll(() => {
    execSync('npm run clean && npm run build', { stdio: 'inherit' });
  }, 60_000);

  it('produces _site/index.html', () => {
    expect(existsSync('_site/index.html')).toBe(true);
  });

  it('index.html contains site title', () => {
    const html = readFileSync('_site/index.html', 'utf-8');
    expect(html).toContain('Pipe Band Predictor');
  });
});
```

- [ ] **Step 2: Create `vitest.config.js`**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    testTimeout: 60_000,
  },
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `.eleventy.js` doesn't exist or build produces nothing.

- [ ] **Step 4: Create `.eleventy.js`**

```js
export default function (eleventyConfig) {
  // Passthrough copy: assets, well-known, redirects/headers
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy('src/.well-known');
  eleventyConfig.addPassthroughCopy({ '_headers': '_headers' });
  eleventyConfig.addPassthroughCopy({ '_redirects': '_redirects' });
  eleventyConfig.addPassthroughCopy('src/robots.txt');

  // Watch CSS/JS for dev reload
  eleventyConfig.addWatchTarget('src/assets/');

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
    templateFormats: ['njk', 'md', 'html'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
}
```

- [ ] **Step 5: Create placeholder `src/index.njk`**

```njk
---
layout: layouts/base.njk
title: Pipe Band Predictor
---
<h1>Pipe Band Predictor</h1>
```

- [ ] **Step 6: Create temporary minimal layout `src/_includes/layouts/base.njk`**

```njk
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{ title }}</title>
</head>
<body>{{ content | safe }}</body>
</html>
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test`
Expected: PASS — both assertions green.

- [ ] **Step 8: Commit**

```bash
git add .eleventy.js vitest.config.js tests/build.test.js src/index.njk src/_includes/layouts/base.njk
git commit -m "feat: add eleventy config and passing build smoke test"
```

---

## Task 3: Static config files (`_headers`, `_redirects`, `robots.txt`)

**Files:**
- Create: `_headers`
- Create: `_redirects`
- Create: `src/robots.txt`
- Modify: `tests/build.test.js`

- [ ] **Step 1: Add failing assertions for config files**

Append to `tests/build.test.js` (inside the `describe` block):

```js
  it('passes through _headers', () => {
    expect(existsSync('_site/_headers')).toBe(true);
    const headers = readFileSync('_site/_headers', 'utf-8');
    expect(headers).toContain('/.well-known/apple-app-site-association');
    expect(headers).toContain('Content-Type: application/json');
  });

  it('passes through _redirects', () => {
    expect(existsSync('_site/_redirects')).toBe(true);
    const redirects = readFileSync('_site/_redirects', 'utf-8');
    expect(redirects).toContain('/invite/* /invite/index.html 200');
  });

  it('passes through robots.txt', () => {
    expect(existsSync('_site/robots.txt')).toBe(true);
    const robots = readFileSync('_site/robots.txt', 'utf-8');
    expect(robots).toContain('Sitemap:');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — files don't exist in `_site/`.

- [ ] **Step 3: Create `_headers`**

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: interest-cohort=()

/.well-known/apple-app-site-association
  Content-Type: application/json

/.well-known/assetlinks.json
  Content-Type: application/json
```

- [ ] **Step 4: Create `_redirects`**

```
# Universal-link invite landing — rewrite (200), not redirect, so URL stays intact
/invite/* /invite/index.html 200

# www → apex
https://www.pipebandpredictor.com/* https://pipebandpredictor.com/:splat 301!
```

- [ ] **Step 5: Create `src/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://pipebandpredictor.com/sitemap.xml
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all five tests green.

- [ ] **Step 7: Commit**

```bash
git add _headers _redirects src/robots.txt tests/build.test.js
git commit -m "feat: add Cloudflare Pages headers, redirects, and robots.txt"
```

---

## Task 4: Design tokens CSS

**Files:**
- Create: `src/assets/css/tokens.css`

- [ ] **Step 1: Create `src/assets/css/tokens.css`**

```css
/* ============================================================
   Design tokens
   Sourced from PipeBandPredictor mobile app (lib/colors.json)
   ============================================================ */

:root {
  /* Brand */
  --color-primary:        #3C8CCA;
  --color-primary-hover:  #2F7AB8;
  --color-primary-deep:   #144571;
  --color-primary-ink:    #0A2C4A;
  --color-secondary:      #E8B923;
  --color-secondary-glow: #FACC15;

  /* Surfaces */
  --color-bg:             #FFFFFF;
  --color-surface:        #FAFBFD;
  --color-surface-2:      #F0F6FC;
  --color-border:         #E2E6EE;

  /* Text */
  --color-text:           #171717;
  --color-text-muted:     #525252;
  --color-text-subtle:    #737373;

  /* Type */
  --font-sans: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;

  /* Spacing scale (matches app: xs..3xl) */
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

  /* Shadows */
  --shadow-card:        0 2px 8px 0 rgb(0 0 0 / 0.08);
  --shadow-card-hover:  0 4px 16px 0 rgb(0 0 0 / 0.12);
  --shadow-card-feat:   0 12px 32px -8px rgb(60 140 202 / 0.25), 0 4px 12px -2px rgb(0 0 0 / 0.10);
  --shadow-glow-primary:   0 0 20px 0 rgb(60 140 202 / 0.40), 0 4px 12px -2px rgb(60 140 202 / 0.25);
  --shadow-glow-secondary: 0 0 20px 0 rgb(232 185 35 / 0.40), 0 4px 12px -2px rgb(232 185 35 / 0.25);

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration: 0.25s;

  /* Layout */
  --container-max: 1100px;
  --content-max: 720px;
}
```

- [ ] **Step 2: Verify build still passes**

Run: `npm test`
Expected: PASS — token file is just a passthrough asset.

- [ ] **Step 3: Commit**

```bash
git add src/assets/css/tokens.css
git commit -m "feat: add design tokens (colors, typography, spacing, shadows)"
```

---

## Task 5: Base CSS (reset, typography, layout primitives)

**Files:**
- Create: `src/assets/css/base.css`

- [ ] **Step 1: Create `src/assets/css/base.css`**

```css
/* ============================================================
   Reset + base
   ============================================================ */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: var(--weight-regular);
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

img, svg { display: block; max-width: 100%; height: auto; }

a {
  color: var(--color-primary-hover);
  text-decoration: none;
  transition: color var(--duration) var(--ease-out);
}
a:hover { color: var(--color-primary); }

ul, ol { list-style: none; }

/* ============================================================
   Type scale
   ============================================================ */

h1, h2, h3, h4 {
  font-family: var(--font-sans);
  color: var(--color-primary-ink);
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: var(--weight-bold);
}

h1 { font-size: clamp(2rem, 1.4rem + 2.6vw, 3.5rem); }
h2 { font-size: clamp(1.5rem, 1.15rem + 1.4vw, 2.25rem); }
h3 { font-size: 1.25rem; font-weight: var(--weight-semibold); }
h4 { font-size: 1rem; font-weight: var(--weight-semibold); }

p { color: var(--color-text-muted); }
p + p { margin-top: var(--space-md); }

small, .small { font-size: 0.8125rem; color: var(--color-text-subtle); }

.label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-primary-hover);
}

/* ============================================================
   Layout primitives
   ============================================================ */

.container {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding-inline: var(--space-xl);
}

.section { padding-block: var(--space-4xl); }
.section--tight { padding-block: var(--space-2xl); }

.section-head { margin-bottom: var(--space-2xl); }
.section-head h2 { margin-top: var(--space-xs); }

/* Visually hidden (for screen-reader-only labels) */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 2: Verify build still passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/assets/css/base.css
git commit -m "feat: add base CSS (reset, typography, layout primitives)"
```

---

## Task 6: Component CSS (buttons, cards, hero, accordion, etc.)

**Files:**
- Create: `src/assets/css/components.css`

- [ ] **Step 1: Create `src/assets/css/components.css`**

```css
/* ============================================================
   Buttons
   ============================================================ */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 12px 22px;
  border-radius: var(--radius-pill);
  font-size: 0.9375rem;
  font-weight: var(--weight-semibold);
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform var(--duration) var(--ease-out),
              box-shadow var(--duration) var(--ease-out),
              background var(--duration) var(--ease-out);
  white-space: nowrap;
}
.btn:hover:not([aria-disabled="true"]) { transform: translateY(-1px); }

.btn--primary {
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-glow-primary);
}
.btn--primary:hover:not([aria-disabled="true"]) {
  background: var(--color-primary-hover);
  color: white;
  box-shadow: var(--shadow-glow-secondary);
}

.btn--ghost {
  background: white;
  color: var(--color-primary-hover);
  border-color: var(--color-border);
}
.btn--ghost:hover:not([aria-disabled="true"]) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn[aria-disabled="true"] {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

/* ============================================================
   Hero
   ============================================================ */

.hero {
  background: linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface-2) 100%);
  padding-block: var(--space-5xl) var(--space-4xl);
}
.hero__grid {
  display: grid;
  gap: var(--space-3xl);
  align-items: center;
  grid-template-columns: 1fr;
}
@media (min-width: 800px) {
  .hero__grid { grid-template-columns: 1.2fr 1fr; }
}
.hero__lead { font-size: clamp(1rem, 0.95rem + 0.4vw, 1.125rem); margin: var(--space-md) 0 var(--space-xl); }
.hero__ctas { display: flex; flex-wrap: wrap; gap: var(--space-md); }
.hero__visual {
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-deep) 100%);
  border-radius: var(--radius-2xl);
  aspect-ratio: 9 / 16;
  max-height: 540px;
  margin-inline: auto;
  width: 80%;
  box-shadow: var(--shadow-card-feat);
}

/* ============================================================
   Cards (feature grid)
   ============================================================ */

.cards {
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-card);
  transition: transform var(--duration) var(--ease-out),
              box-shadow var(--duration) var(--ease-out);
}
.card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
.card__icon {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  color: var(--color-primary);
  margin-bottom: var(--space-md);
}
.card__icon svg { width: 22px; height: 22px; }
.card h3 { color: var(--color-primary-ink); margin-bottom: var(--space-xs); }
.card p { font-size: 0.9375rem; }

/* ============================================================
   How-it-works steps
   ============================================================ */

.steps {
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  counter-reset: step;
}
.step {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  position: relative;
  counter-increment: step;
}
.step::before {
  content: counter(step);
  position: absolute;
  top: var(--space-lg); right: var(--space-lg);
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-primary);
  color: white;
  font-weight: var(--weight-bold);
  border-radius: var(--radius-pill);
}
.step h3 { margin: 0 0 var(--space-xs); padding-right: 40px; }

/* ============================================================
   Scoring callout
   ============================================================ */

.scoring {
  background: linear-gradient(135deg, #FFFBE6 0%, #FFF7D6 100%);
  border: 1px solid #F5E0A0;
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
}
.scoring__grid {
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-top: var(--space-xl);
}
.scoring__tile {
  background: white;
  border: 1px solid #EFD97C;
  border-radius: var(--radius-md);
  padding: var(--space-lg);
}
.scoring__pts {
  display: inline-block;
  font-size: 1.5rem;
  font-weight: var(--weight-bold);
  color: var(--color-primary-ink);
  background: var(--color-secondary);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius);
  margin-bottom: var(--space-sm);
}

/* ============================================================
   Schedule strip
   ============================================================ */

.schedule {
  display: flex;
  gap: var(--space-md);
  overflow-x: auto;
  padding-bottom: var(--space-md);
  scroll-snap-type: x mandatory;
}
.schedule__chip {
  flex: 0 0 auto;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  min-width: 180px;
  scroll-snap-align: start;
}
.schedule__chip--major { background: #FFFBE6; border-color: #F5D76E; }
.schedule__name { font-weight: var(--weight-semibold); color: var(--color-primary-ink); }
.schedule__date { font-size: 0.875rem; color: var(--color-text-muted); margin-top: 2px; }
.schedule__pill {
  display: inline-block;
  background: var(--color-secondary);
  color: var(--color-primary-ink);
  font-size: 0.6875rem;
  font-weight: var(--weight-bold);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  margin-top: var(--space-sm);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.schedule__empty {
  color: var(--color-text-subtle);
  font-style: italic;
  padding: var(--space-lg);
}

/* ============================================================
   Screenshots strip
   ============================================================ */

.screenshots {
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  max-width: 760px;
  margin: 0 auto;
}
.screenshots img {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card-feat);
}

/* ============================================================
   FAQ accordion (native details/summary)
   ============================================================ */

.faq__group { margin-bottom: var(--space-2xl); }
.faq__group-heading { color: var(--color-primary-deep); margin-bottom: var(--space-md); }

.faq__item {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-sm);
  overflow: hidden;
}
.faq__item summary {
  list-style: none;
  cursor: pointer;
  padding: var(--space-lg) var(--space-xl);
  font-weight: var(--weight-semibold);
  color: var(--color-primary-ink);
  position: relative;
  padding-right: 48px;
}
.faq__item summary::-webkit-details-marker { display: none; }
.faq__item summary::after {
  content: '+';
  position: absolute;
  right: var(--space-xl);
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: var(--color-primary);
  transition: transform var(--duration) var(--ease-out);
}
.faq__item[open] summary::after { transform: translateY(-50%) rotate(45deg); }
.faq__item__body { padding: 0 var(--space-xl) var(--space-lg); color: var(--color-text-muted); }

/* ============================================================
   Nav
   ============================================================ */

.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}
.nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: var(--space-md);
}
.nav__brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: var(--weight-bold);
  color: var(--color-primary-ink);
}
.nav__links {
  display: none;
  gap: var(--space-xl);
}
.nav__links a {
  color: var(--color-text-muted);
  font-weight: var(--weight-medium);
}
.nav__links a:hover, .nav__links a[aria-current="page"] { color: var(--color-primary); }
.nav__toggle {
  background: none;
  border: 0;
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.nav__toggle span {
  display: block; width: 22px; height: 2px;
  background: var(--color-primary-ink);
  position: relative;
}
.nav__toggle span::before, .nav__toggle span::after {
  content: ''; position: absolute; left: 0; width: 22px; height: 2px;
  background: var(--color-primary-ink);
}
.nav__toggle span::before { top: -6px; }
.nav__toggle span::after  { top:  6px; }

@media (min-width: 720px) {
  .nav__links { display: flex; }
  .nav__toggle { display: none; }
}

.nav__menu[aria-hidden="true"] { display: none; }
.nav__menu {
  background: white;
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-lg) var(--space-xl);
}
.nav__menu a { display: block; padding: var(--space-sm) 0; color: var(--color-text); }

/* ============================================================
   Footer
   ============================================================ */

.footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding-block: var(--space-3xl);
}
.footer__grid {
  display: grid;
  gap: var(--space-2xl);
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}
.footer h4 {
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-primary-ink);
  margin-bottom: var(--space-md);
}
.footer ul li { margin-bottom: var(--space-sm); }
.footer__bottom {
  margin-top: var(--space-3xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
  font-size: 0.8125rem;
  color: var(--color-text-subtle);
}

/* ============================================================
   Invite landing
   ============================================================ */

.invite {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-block: var(--space-3xl);
}
.invite__card {
  max-width: 420px;
  text-align: center;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-card-feat);
}
.invite__code {
  display: inline-block;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 1.5rem;
  letter-spacing: 0.18em;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-xl);
  margin-block: var(--space-lg);
  color: var(--color-primary-deep);
}
.invite__copy-status {
  font-size: 0.8125rem;
  color: var(--color-text-subtle);
  min-height: 1.2em;
  margin-top: var(--space-sm);
}
```

- [ ] **Step 2: Verify build still passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/assets/css/components.css
git commit -m "feat: add component CSS (buttons, cards, hero, FAQ, nav, footer, invite)"
```

---

## Task 7: site.json data + base & page layouts + head/og partials

**Files:**
- Create: `src/_data/site.json`
- Create: `src/_data/nav.json`
- Create: `src/_includes/partials/head.njk`
- Create: `src/_includes/partials/og.njk`
- Modify: `src/_includes/layouts/base.njk` (replace placeholder)
- Create: `src/_includes/layouts/page.njk`

- [ ] **Step 1: Create `src/_data/site.json`**

```json
{
  "name": "Pipe Band Predictor",
  "shortName": "PipeBandPredictor",
  "tagline": "The prediction game for Grade 1 pipe band championships.",
  "url": "https://pipebandpredictor.com",
  "themeColor": "#3C8CCA",
  "supportEmail": "support@surfacedevelopment.co.uk",
  "company": "Surface Development",
  "companyUrl": "https://surfacedevelopment.co.uk",
  "appStore": {
    "ios": "https://apps.apple.com/gb/app/pipe-band-predictor/id6758277252",
    "iosAvailable": true,
    "android": null,
    "androidAvailable": false
  },
  "ogImage": "/assets/img/og/pipe-band-predictor.png"
}
```

- [ ] **Step 2: Create `src/_data/nav.json`**

```json
[
  { "title": "Home",         "url": "/" },
  { "title": "How it Works", "url": "/how-it-works/" },
  { "title": "FAQ",          "url": "/faq/" },
  { "title": "Support",      "url": "/support/" }
]
```

- [ ] **Step 3: Create `src/_includes/partials/head.njk`**

```njk
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{% if title %}{{ title }} – {{ site.name }}{% else %}{{ site.name }}{% endif %}</title>
<meta name="description" content="{{ description or site.tagline }}">
<meta name="theme-color" content="{{ site.themeColor }}">

<link rel="canonical" href="{{ site.url }}{{ page.url }}">

<link rel="icon" href="/assets/img/icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/icons/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/base.css">
<link rel="stylesheet" href="/assets/css/components.css">

{% include "partials/og.njk" %}
```

- [ ] **Step 4: Create `src/_includes/partials/og.njk`**

```njk
<meta property="og:type" content="website">
<meta property="og:title" content="{{ title or site.name }}">
<meta property="og:description" content="{{ description or site.tagline }}">
<meta property="og:url" content="{{ site.url }}{{ page.url }}">
<meta property="og:image" content="{{ site.url }}{{ site.ogImage }}">
<meta property="og:site_name" content="{{ site.name }}">
<meta property="og:locale" content="en_GB">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ title or site.name }}">
<meta name="twitter:description" content="{{ description or site.tagline }}">
<meta name="twitter:image" content="{{ site.url }}{{ site.ogImage }}">
```

- [ ] **Step 5: Replace `src/_includes/layouts/base.njk`**

```njk
<!DOCTYPE html>
<html lang="en">
<head>
  {% include "partials/head.njk" %}
</head>
<body>
  {% include "partials/nav.njk" %}
  <main id="main">{{ content | safe }}</main>
  {% include "partials/footer.njk" %}
  <script src="/assets/js/nav.js" defer></script>
  {% block extraScripts %}{% endblock %}
</body>
</html>
```

- [ ] **Step 6: Create `src/_includes/layouts/page.njk`**

```njk
---
layout: layouts/base.njk
---
<article class="container section">
  <header class="section-head">
    <h1>{{ title }}</h1>
    {% if intro %}<p class="hero__lead">{{ intro }}</p>{% endif %}
  </header>
  {{ content | safe }}
</article>
```

- [ ] **Step 7: Add a tiny placeholder partial so build doesn't fail**

Create `src/_includes/partials/nav.njk`:

```njk
<!-- nav placeholder until Task 8 -->
```

Create `src/_includes/partials/footer.njk`:

```njk
<!-- footer placeholder until Task 9 -->
```

- [ ] **Step 8: Update `src/index.njk` placeholder to use the new chrome**

```njk
---
layout: layouts/base.njk
title: ""
description: "The prediction game for Grade 1 pipe band championships."
---
<h1>Pipe Band Predictor</h1>
```

- [ ] **Step 9: Build and verify**

Run: `npm test`
Expected: PASS — build succeeds, `_site/index.html` contains `<title>Pipe Band Predictor</title>` and the canonical link.

- [ ] **Step 10: Commit**

```bash
git add src/_data/ src/_includes/ src/index.njk
git commit -m "feat: add base/page layouts, head and og partials, site data"
```

---

## Task 8: Nav partial + mobile menu JS

**Files:**
- Modify: `src/_includes/partials/nav.njk`
- Create: `src/assets/js/nav.js`
- Create: `src/assets/img/logo.svg`

- [ ] **Step 1: Create `src/assets/img/logo.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
  <path d="M8 20 L16 8 L24 20" stroke="#3C8CCA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M6 24 L26 24" stroke="#3C8CCA" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  <path d="M10 22 L22 22" stroke="#3C8CCA" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
</svg>
```

- [ ] **Step 2: Replace `src/_includes/partials/nav.njk`**

```njk
<header class="nav">
  <div class="container nav__inner">
    <a href="/" class="nav__brand" aria-label="{{ site.name }} home">
      <img src="/assets/img/logo.svg" alt="" width="28" height="28">
      <span>{{ site.shortName }}</span>
    </a>
    <nav aria-label="Primary">
      <ul class="nav__links">
        {% for item in nav %}
          <li>
            <a href="{{ item.url }}"{% if page.url == item.url %} aria-current="page"{% endif %}>{{ item.title }}</a>
          </li>
        {% endfor %}
      </ul>
      <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="Toggle navigation">
        <span></span>
      </button>
    </nav>
  </div>
  <div class="nav__menu" id="nav-menu" aria-hidden="true">
    {% for item in nav %}
      <a href="{{ item.url }}"{% if page.url == item.url %} aria-current="page"{% endif %}>{{ item.title }}</a>
    {% endfor %}
  </div>
</header>
```

- [ ] **Step 3: Create `src/assets/js/nav.js`**

```js
(function () {
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.setAttribute('aria-hidden', String(open));
  });
})();
```

- [ ] **Step 4: Build and verify**

Run: `npm test`
Expected: PASS — build still succeeds, nav renders into output HTML.

- [ ] **Step 5: Manually verify nav renders correctly**

Run: `npm run dev` in another terminal, open `http://localhost:8080`. Confirm: logo + "PipeBandPredictor" brand on left, four nav links on right (desktop), hamburger toggle (mobile via narrow window).

- [ ] **Step 6: Commit**

```bash
git add src/_includes/partials/nav.njk src/assets/js/nav.js src/assets/img/logo.svg
git commit -m "feat: add navigation partial, logo, and mobile menu toggle"
```

---

## Task 9: Footer partial + store-buttons partial

**Files:**
- Modify: `src/_includes/partials/footer.njk`
- Create: `src/_includes/partials/store-buttons.njk`

- [ ] **Step 1: Replace `src/_includes/partials/footer.njk`**

```njk
<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div>
        <a href="/" class="nav__brand"><img src="/assets/img/logo.svg" alt="" width="28" height="28"><span>{{ site.shortName }}</span></a>
        <p style="margin-top: var(--space-md); font-size: 0.875rem;">Built by <a href="{{ site.companyUrl }}">{{ site.company }}</a>.</p>
      </div>
      <div>
        <h4>Navigate</h4>
        <ul>
          {% for item in nav %}
            <li><a href="{{ item.url }}">{{ item.title }}</a></li>
          {% endfor %}
        </ul>
      </div>
      <div>
        <h4>Legal</h4>
        <ul>
          <li><a href="/privacy/">Privacy</a></li>
          <li><a href="/terms/">Terms</a></li>
          <li><a href="/data-deletion/">Data Deletion</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:{{ site.supportEmail }}">{{ site.supportEmail }}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <span>&copy; <span id="copyright-year"></span> {{ site.company }}</span>
      <span>Made in the United Kingdom</span>
    </div>
  </div>
  <script>document.getElementById('copyright-year').textContent = new Date().getFullYear();</script>
</footer>
```

- [ ] **Step 2: Create `src/_includes/partials/store-buttons.njk`**

```njk
<div class="hero__ctas">
  {% if site.appStore.iosAvailable %}
    <a href="{{ site.appStore.ios }}" class="btn btn--primary" rel="noopener">
      Download for iOS
    </a>
  {% else %}
    <span class="btn btn--primary" aria-disabled="true">App Store · soon</span>
  {% endif %}

  {% if site.appStore.androidAvailable %}
    <a href="{{ site.appStore.android }}" class="btn btn--ghost" rel="noopener">
      Get it on Google Play
    </a>
  {% else %}
    <span class="btn btn--ghost" aria-disabled="true">Play Store · soon</span>
  {% endif %}
</div>
```

- [ ] **Step 3: Build and verify**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/_includes/partials/footer.njk src/_includes/partials/store-buttons.njk
git commit -m "feat: add footer and store-buttons partials"
```

---

## Task 10: Sanity schedule data file (TDD with mock)

**Files:**
- Create: `tests/schedule.test.js`
- Create: `src/_data/schedule.js`
- Modify: `package.json` (no change — `@sanity/client` already a dep)

- [ ] **Step 1: Write failing test for schedule data file**

Create `tests/schedule.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchMock = vi.fn();

vi.mock('@sanity/client', () => ({
  createClient: () => ({ fetch: fetchMock }),
}));

beforeEach(() => {
  fetchMock.mockReset();
  delete process.env.SANITY_PROJECT_ID;
  delete process.env.SANITY_DATASET;
  delete process.env.SANITY_READ_TOKEN;
});

async function loadSchedule() {
  // Re-import each call so module-level state isn't cached across tests
  vi.resetModules();
  const mod = await import('../src/_data/schedule.js');
  return mod.default();
}

describe('schedule data file', () => {
  it('returns rounds when Sanity responds successfully', async () => {
    process.env.SANITY_PROJECT_ID = 'pipebandpredictor';
    process.env.SANITY_DATASET = 'production';
    fetchMock.mockResolvedValue([
      { _id: '1', name: 'British Championships', eventDate: '2026-05-17', roundType: 'band', season: '2026' },
      { _id: '2', name: 'World Pipe Band Championships', eventDate: '2026-08-15', roundType: 'band', season: '2026' },
    ]);
    const result = await loadSchedule();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('British Championships');
    expect(result[1].isMajor).toBe(true);
  });

  it('returns [] when env vars are missing', async () => {
    const result = await loadSchedule();
    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns [] and does not throw when Sanity fetch fails', async () => {
    process.env.SANITY_PROJECT_ID = 'pipebandpredictor';
    process.env.SANITY_DATASET = 'production';
    fetchMock.mockRejectedValue(new Error('network down'));
    const result = await loadSchedule();
    expect(result).toEqual([]);
  });

  it('marks Worlds rounds with isMajor=true', async () => {
    process.env.SANITY_PROJECT_ID = 'pipebandpredictor';
    process.env.SANITY_DATASET = 'production';
    fetchMock.mockResolvedValue([
      { _id: '1', name: 'Scottish Championships', eventDate: '2026-07-26', roundType: 'band', season: '2026' },
      { _id: '2', name: 'World Pipe Band Championships', eventDate: '2026-08-15', roundType: 'band', season: '2026' },
    ]);
    const result = await loadSchedule();
    expect(result[0].isMajor).toBe(false);
    expect(result[1].isMajor).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/schedule.test.js`
Expected: FAIL — `src/_data/schedule.js` doesn't exist.

- [ ] **Step 3: Implement `src/_data/schedule.js`**

```js
import { createClient } from '@sanity/client';

const QUERY = `*[_type == "round" && eventDate >= now()] | order(eventDate asc) {
  _id,
  name,
  roundType,
  eventDate,
  predictionsOpenAt,
  predictionsCloseAt,
  "season": season->name
}`;

function isMajorEvent(name) {
  return /world/i.test(name || '');
}

export default async function () {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;

  if (!projectId || !dataset) {
    return [];
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-12-01',
    useCdn: true,
    token: process.env.SANITY_READ_TOKEN || undefined,
  });

  try {
    const rounds = await client.fetch(QUERY);
    return (rounds || []).map(r => ({ ...r, isMajor: isMajorEvent(r.name) }));
  } catch (err) {
    console.warn('[schedule] Sanity fetch failed, returning empty schedule:', err.message);
    return [];
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/schedule.test.js`
Expected: PASS — all four tests green.

- [ ] **Step 5: Run full test suite to confirm nothing else broke**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Create `.env.example`**

```
# Sanity CMS — read-only credentials for build-time schedule fetch
# Local dev: copy this file to .env and fill in values, or leave SANITY_*
# unset to render the empty-state schedule.
SANITY_PROJECT_ID=pipebandpredictor
SANITY_DATASET=production
# SANITY_READ_TOKEN=        # only needed if dataset is private
```

- [ ] **Step 7: Commit**

```bash
git add tests/schedule.test.js src/_data/schedule.js .env.example
git commit -m "feat: add Sanity-backed schedule data file with graceful empty-state fallback"
```

---

## Task 11: Features data + Homepage (`/`)

**Files:**
- Create: `src/_data/features.json`
- Modify: `src/index.njk` (full implementation)

- [ ] **Step 1: Create `src/_data/features.json`**

```json
[
  {
    "title": "Predictions",
    "icon": "edit",
    "description": "Rank your top finishers for every Grade 1 contest. Predictions lock when the round closes."
  },
  {
    "title": "Leagues",
    "icon": "users",
    "description": "Compete in private leagues with friends, family, or fellow piping fans via a 7-character invite code."
  },
  {
    "title": "Leaderboards",
    "icon": "chart",
    "description": "Global and league-specific rankings. Track your accuracy across the whole season."
  },
  {
    "title": "Seasons",
    "icon": "calendar",
    "description": "Follow the full season from the British through to the Worlds. Every major comes alive."
  }
]
```

- [ ] **Step 2: Replace `src/index.njk` with full homepage**

```njk
---
layout: layouts/base.njk
title: ""
description: "The prediction game for Grade 1 pipe band championships. Pick your podium, climb the leaderboard, beat your friends."
---

<!-- HERO -->
<section class="hero">
  <div class="container hero__grid">
    <div>
      <span class="label">Season {{ "now" | date: "%Y" }} · Grade 1</span>
      <h1 style="margin-top: var(--space-sm);">Predict the top 6.</h1>
      <p class="hero__lead">{{ description }}</p>
      {% include "partials/store-buttons.njk" %}
    </div>
    <div class="hero__visual" aria-hidden="true"></div>
  </div>
</section>

<!-- FEATURES -->
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="label">Features</span>
      <h2>Everything you need to compete.</h2>
    </div>
    <div class="cards">
      {% for f in features %}
        <article class="card">
          <div class="card__icon">{% include "partials/icons/" + f.icon + ".njk" ignore missing %}</div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.description }}</p>
        </article>
      {% endfor %}
    </div>
  </div>
</section>

<!-- HOW IT WORKS TEASER -->
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="label">How it works</span>
      <h2>Three steps to your prediction.</h2>
    </div>
    <ol class="steps">
      <li class="step"><h3>Pick</h3><p>Drag bands into your predicted finishing order before the round closes.</p></li>
      <li class="step"><h3>Watch</h3><p>Follow the contest live. Predictions lock at the start of the round.</p></li>
      <li class="step"><h3>Score</h3><p>3 points for an exact match, 1 point for a correct band in the wrong slot.</p></li>
    </ol>
    <p style="margin-top: var(--space-xl);"><a href="/how-it-works/" class="btn btn--ghost">Read the full breakdown →</a></p>
  </div>
</section>

<!-- SCORING CALLOUT -->
<section class="section">
  <div class="container">
    <div class="scoring">
      <span class="label">Scoring</span>
      <h2>How points are awarded.</h2>
      <p style="margin-top: var(--space-md);">The scoring system adapts to each contest — single-winner rounds, top-6 rounds, top-4 rounds, and everything in between.</p>
      <div class="scoring__grid">
        <div class="scoring__tile"><span class="scoring__pts">2 pts</span><h3>Single-winner round</h3><p>Award given for the correct pick.</p></div>
        <div class="scoring__tile"><span class="scoring__pts">3 pts</span><h3>Exact position match</h3><p>You ranked the band in the exact spot they finished.</p></div>
        <div class="scoring__tile"><span class="scoring__pts">1 pt</span><h3>Correct band, wrong slot</h3><p>You picked the band but in a different position.</p></div>
      </div>
    </div>
  </div>
</section>

<!-- SCREENSHOTS -->
<section class="section">
  <div class="container">
    <div class="section-head" style="text-align: center;">
      <span class="label">Preview</span>
      <h2>See it in action.</h2>
    </div>
    <div class="screenshots">
      <img src="/assets/img/screenshots/home.png" alt="Home screen showing upcoming rounds" loading="lazy">
      <img src="/assets/img/screenshots/predictions.png" alt="Predictions screen with bands ranked" loading="lazy">
      <img src="/assets/img/screenshots/results.png" alt="Results and league leaderboard screen" loading="lazy">
    </div>
  </div>
</section>

<!-- SCHEDULE -->
<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="label">Upcoming</span>
      <h2>Season schedule.</h2>
    </div>
    {% if schedule and schedule.length %}
      <div class="schedule">
        {% for round in schedule %}
          <div class="schedule__chip{% if round.isMajor %} schedule__chip--major{% endif %}">
            <div class="schedule__name">{{ round.name }}</div>
            <div class="schedule__date">{{ round.eventDate | date: "%-d %b %Y" }}</div>
            {% if round.isMajor %}<span class="schedule__pill">Major</span>{% endif %}
          </div>
        {% endfor %}
      </div>
    {% else %}
      <p class="schedule__empty">The next season's rounds will appear here once they're announced.</p>
    {% endif %}
  </div>
</section>

<!-- DOWNLOAD CTA -->
<section class="section" style="background: linear-gradient(135deg, var(--color-surface-2) 0%, #FFFBE6 100%); border-radius: var(--radius-2xl); margin: var(--space-2xl) auto; max-width: var(--container-max);">
  <div class="container" style="text-align: center;">
    <span class="label">Download</span>
    <h2 style="margin-top: var(--space-sm);">Get the app.</h2>
    <p style="max-width: 480px; margin: var(--space-md) auto var(--space-xl);">Free on the App Store. Coming to Google Play soon.</p>
    <div style="display: flex; justify-content: center;">
      {% include "partials/store-buttons.njk" %}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add a Nunjucks date filter for the year token**

Eleventy ships with a Liquid `date` filter; for Nunjucks we need a tiny addition. Modify `.eleventy.js` — find the `export default function (eleventyConfig) {` line and add **before the return**:

```js
  eleventyConfig.addFilter('date', (value, format = '%Y-%m-%d') => {
    const d = value === 'now' ? new Date() : new Date(value);
    if (isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return format
      .replace('%Y', d.getFullYear())
      .replace('%m', pad(d.getMonth() + 1))
      .replace('%-d', d.getDate())
      .replace('%d', pad(d.getDate()))
      .replace('%b', months[d.getMonth()]);
  });
```

- [ ] **Step 4: Create empty icon partials (no-op for now)**

To avoid broken includes, create `src/_includes/partials/icons/` with placeholder SVGs:

`src/_includes/partials/icons/edit.njk`:
```njk
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854Z"/></svg>
```

`src/_includes/partials/icons/users.njk`:
```njk
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
```

`src/_includes/partials/icons/chart.njk`:
```njk
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-5"/></svg>
```

`src/_includes/partials/icons/calendar.njk`:
```njk
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
```

- [ ] **Step 5: Copy screenshot assets from sibling Surface site**

```bash
mkdir -p src/assets/img/screenshots
cp ../surfacedevelopment-site/assets/screenshots/home.PNG src/assets/img/screenshots/home.png
cp ../surfacedevelopment-site/assets/screenshots/predictions.PNG src/assets/img/screenshots/predictions.png
cp ../surfacedevelopment-site/assets/screenshots/results.PNG src/assets/img/screenshots/results.png
```

(Path is relative to the project root. If the sibling repo isn't checked out, leave the screenshots out and the `<img>` tags will 404 — non-fatal; replace later.)

- [ ] **Step 6: Build and verify**

Run: `npm test`
Expected: PASS — build succeeds, `_site/index.html` contains "Predict the top 6.".

- [ ] **Step 7: Visual smoke test**

Run: `npm run dev` and open `http://localhost:8080`. Confirm the homepage renders all 8 sections in order. The schedule strip will show the empty-state message until Sanity env vars are configured.

- [ ] **Step 8: Commit**

```bash
git add src/_data/features.json src/index.njk .eleventy.js src/_includes/partials/icons/ src/assets/img/screenshots/ 2>/dev/null
git commit -m "feat: add homepage with hero, features, how-it-works, scoring, screenshots, schedule, download CTA"
```

---

## Task 12: How-it-works page

**Files:**
- Create: `src/how-it-works.njk`

- [ ] **Step 1: Create `src/how-it-works.njk`**

```njk
---
layout: layouts/base.njk
title: How it works
description: Make predictions, watch the contest, score points. The full breakdown of how PipeBandPredictor works.
permalink: /how-it-works/
---

<section class="section">
  <div class="container" style="max-width: var(--content-max);">
    <span class="label">How it works</span>
    <h1 style="margin-top: var(--space-sm);">Make predictions, watch the contest, score points.</h1>
    <p class="hero__lead">Every Grade 1 contest of the season opens for predictions in the app. Make your picks before the round closes, and earn points based on how close you are to the actual results.</p>
  </div>
</section>

<section class="section section--tight">
  <div class="container">
    <div class="section-head"><span class="label">Step by step</span><h2>The full flow.</h2></div>
    <ol class="steps">
      <li class="step">
        <h3>Open the round</h3>
        <p>Each contest appears in the app a few days before the event. You'll see the band list and the prediction groups (e.g. main band contest, drumming).</p>
      </li>
      <li class="step">
        <h3>Rank your picks</h3>
        <p>Drag and drop bands into the order you think they'll finish. You can change your mind any time before the round closes.</p>
      </li>
      <li class="step">
        <h3>Watch and score</h3>
        <p>Predictions lock when the round closes. After the event, official results are entered and your score is calculated automatically.</p>
      </li>
    </ol>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width: var(--content-max);">
    <div class="scoring">
      <span class="label">Scoring rules</span>
      <h2>How points are awarded.</h2>
      <p style="margin-top: var(--space-md);">Different contests announce different numbers of positions. The scoring rules adapt automatically — here's what to expect.</p>

      <h3 style="margin-top: var(--space-xl);">Single-winner rounds</h3>
      <p>Some prediction groups have just one winner (e.g. solo piping finals). For these:</p>
      <ul style="list-style: disc; padding-left: var(--space-xl); color: var(--color-text-muted);">
        <li><strong>2 points</strong> — you picked the eventual winner.</li>
      </ul>

      <h3 style="margin-top: var(--space-xl);">Multi-position rounds</h3>
      <p>Most band contests have multiple announced positions (top 6, top 4, etc.). For these:</p>
      <ul style="list-style: disc; padding-left: var(--space-xl); color: var(--color-text-muted);">
        <li><strong>3 points</strong> — exact position match (you predicted Inveraray would come 2nd, and they came 2nd).</li>
        <li><strong>1 point</strong> — correct band, wrong position (you predicted Inveraray would come 4th, but they came 2nd).</li>
      </ul>

      <h3 style="margin-top: var(--space-xl);">Worked example</h3>
      <p>Imagine the British Championships top 6 ends up as: 1. SLOT, 2. Inveraray, 3. Field Marshall, 4. Boghall, 5. ScottishPower, 6. Glasgow Skye.</p>
      <p>Your prediction was: 1. SLOT, 2. Field Marshall, 3. Inveraray, 4. Boghall, 5. ScottishPower, 6. Police Scotland Fife.</p>
      <ul style="list-style: disc; padding-left: var(--space-xl); color: var(--color-text-muted);">
        <li>SLOT 1st → <strong>3 pts</strong> (exact)</li>
        <li>Field Marshall (you said 2nd, they came 3rd) → <strong>1 pt</strong></li>
        <li>Inveraray (you said 3rd, they came 2nd) → <strong>1 pt</strong></li>
        <li>Boghall 4th → <strong>3 pts</strong> (exact)</li>
        <li>ScottishPower 5th → <strong>3 pts</strong> (exact)</li>
        <li>Police Scotland Fife — not in the top 6 → <strong>0 pts</strong></li>
      </ul>
      <p><strong>Total: 11 points.</strong></p>
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width: var(--content-max);">
    <span class="label">Leagues</span>
    <h2>Compete with friends.</h2>
    <p style="margin-top: var(--space-md);">Beyond the global leaderboard, you can create or join private leagues to compete with a smaller group — your fellow band members, your social-media circle, or your family.</p>
    <p>Each league has a 7-character invite code. Share the code (or the invite link) and anyone with the app can join.</p>
    <p><em>Note: invite links via web are coming back in a future app update — for now, share the code directly inside the app.</em></p>
  </div>
</section>

<section class="section">
  <div class="container" style="text-align: center;">
    <h2>Get the app.</h2>
    <div style="display: flex; justify-content: center; margin-top: var(--space-xl);">
      {% include "partials/store-buttons.njk" %}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build and verify**

Run: `npm test`
Expected: PASS, plus check `_site/how-it-works/index.html` exists.

- [ ] **Step 3: Commit**

```bash
git add src/how-it-works.njk
git commit -m "feat: add how-it-works page with scoring rules and worked example"
```

---

## Task 13: FAQ data + page

**Files:**
- Create: `src/_data/faq.json`
- Create: `src/faq.njk`

- [ ] **Step 1: Create `src/_data/faq.json`**

```json
[
  {
    "group": "Scoring",
    "items": [
      { "q": "How are points awarded?", "a": "It depends on the prediction group. Single-winner groups award 2 points for picking the winner. Multi-position groups award 3 points for an exact position match and 1 point for a correct band in the wrong position." },
      { "q": "What if there's a tie?", "a": "Ties on the leaderboard are broken by total exact-match points first, then by total picks made across the season." },
      { "q": "When do scores update?", "a": "Scores are computed once results are entered into the app, usually within a few hours of the event finishing." }
    ]
  },
  {
    "group": "Leagues",
    "items": [
      { "q": "How do I create a league?", "a": "Inside the app, head to the Leagues tab and tap Create. You'll get a 7-character code to share with anyone you want to invite." },
      { "q": "How do I join a league?", "a": "Get the code from the league owner, then enter it on the Leagues tab. League invites via web links are returning in a future app update." },
      { "q": "Can I leave a league?", "a": "Yes — open the league, open its menu, and choose Leave. You can always rejoin later if you have the code." }
    ]
  },
  {
    "group": "Results & data",
    "items": [
      { "q": "Where do you get results from?", "a": "Results are entered manually after each contest, sourced from official RSPBA announcements and contest websites." },
      { "q": "How long after an event do scores update?", "a": "Usually within a few hours, sometimes the same evening. Larger championships with many prediction groups can take a little longer." }
    ]
  },
  {
    "group": "Account",
    "items": [
      { "q": "How do I sign in?", "a": "We support Sign in with Apple, Google, and Facebook. No passwords to remember." },
      { "q": "How do I delete my account?", "a": "See the Data Deletion page for the full process. In short: email support and we'll remove your data within 30 days." }
    ]
  },
  {
    "group": "Platforms",
    "items": [
      { "q": "Is there an Android version?", "a": "Yes — coming soon. The Android build is in review and we'll update this page (and the homepage) the moment the Play Store listing goes live." },
      { "q": "Is there a web version?", "a": "Not currently. The full prediction experience needs the touch interactions of the mobile app." }
    ]
  }
]
```

- [ ] **Step 2: Create `src/faq.njk`**

```njk
---
layout: layouts/base.njk
title: FAQ
description: Frequently asked questions about predictions, scoring, leagues, and account management.
permalink: /faq/
---

<section class="section">
  <div class="container" style="max-width: var(--content-max);">
    <span class="label">FAQ</span>
    <h1 style="margin-top: var(--space-sm);">Frequently asked questions.</h1>
    <p class="hero__lead">Quick answers about scoring, leagues, results, and accounts. Can't find what you're looking for? <a href="/support/">Get in touch.</a></p>
  </div>
</section>

<section class="section section--tight">
  <div class="container" style="max-width: var(--content-max);">
    {% for group in faq %}
      <div class="faq__group">
        <h2 class="faq__group-heading">{{ group.group }}</h2>
        {% for item in group.items %}
          <details class="faq__item">
            <summary>{{ item.q }}</summary>
            <div class="faq__item__body">{{ item.a }}</div>
          </details>
        {% endfor %}
      </div>
    {% endfor %}
  </div>
</section>
```

- [ ] **Step 3: Build and verify**

Run: `npm test`
Expected: PASS, `_site/faq/index.html` exists.

- [ ] **Step 4: Manually verify accordion**

Run: `npm run dev`, navigate to `/faq/`, click any question — should expand. Click again — should collapse.

- [ ] **Step 5: Commit**

```bash
git add src/_data/faq.json src/faq.njk
git commit -m "feat: add FAQ page with native details/summary accordion"
```

---

## Task 14: Support page

**Files:**
- Create: `src/support.njk`

- [ ] **Step 1: Create `src/support.njk`**

```njk
---
layout: layouts/base.njk
title: Support
description: Get help with PipeBandPredictor — contact support, report bugs, request features.
permalink: /support/
---

<section class="section">
  <div class="container" style="max-width: var(--content-max);">
    <span class="label">Support</span>
    <h1 style="margin-top: var(--space-sm);">We're here to help.</h1>
    <p class="hero__lead">PipeBandPredictor is built and maintained by Surface Development. Email is the fastest way to reach us.</p>

    <h2 style="margin-top: var(--space-2xl);">Contact</h2>
    <p>Email: <a href="mailto:{{ site.supportEmail }}">{{ site.supportEmail }}</a></p>
    <p>We aim to reply within two working days.</p>

    <h2 style="margin-top: var(--space-2xl);">Found a bug or have a feature request?</h2>
    <p>Send a quick note to the same address. The more detail the better — what you were doing, what you expected, what happened, your device model and OS version. Screenshots help a lot.</p>

    <h2 style="margin-top: var(--space-2xl);">Account &amp; data</h2>
    <ul style="list-style: disc; padding-left: var(--space-xl); color: var(--color-text-muted);">
      <li><a href="/privacy/">Privacy policy</a></li>
      <li><a href="/terms/">Terms of service</a></li>
      <li><a href="/data-deletion/">How to delete your data</a></li>
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Build and verify**

Run: `npm test`
Expected: PASS, `_site/support/index.html` exists.

- [ ] **Step 3: Commit**

```bash
git add src/support.njk
git commit -m "feat: add support page with contact details and links to legal/data-deletion"
```

---

## Task 15: Legal pages — Privacy, Terms, Data Deletion

**Files:**
- Create: `src/privacy.njk`
- Create: `src/terms.njk`
- Create: `src/data-deletion.njk`

These pages adapt the existing Surface site copy. The pages below contain initial structure with neutral placeholder copy that the user (or a follow-up content task) will refine. **Do not ship to production** without a content review pass — flag this in the README.

- [ ] **Step 1: Create `src/privacy.njk`**

```njk
---
layout: layouts/base.njk
title: Privacy Policy
description: Privacy policy for PipeBandPredictor.
permalink: /privacy/
---

<section class="section">
  <div class="container" style="max-width: var(--content-max);">
    <span class="label">Legal</span>
    <h1 style="margin-top: var(--space-sm);">Privacy Policy</h1>
    <p class="hero__lead">Last updated: 3 May 2026.</p>

    <h2 style="margin-top: var(--space-2xl);">Who we are</h2>
    <p>PipeBandPredictor (the "app") is operated by Surface Development ("we", "us"), based in the United Kingdom. This privacy policy describes what data we collect, why, and how we use it.</p>

    <h2 style="margin-top: var(--space-2xl);">Data we collect</h2>
    <p>When you sign in to the app, we collect:</p>
    <ul style="list-style: disc; padding-left: var(--space-xl); color: var(--color-text-muted);">
      <li>Your name and email address (from your chosen sign-in provider: Apple, Google, or Facebook).</li>
      <li>A profile photo, if you choose to set one.</li>
      <li>The predictions you make, the leagues you join, and your accumulated scores.</li>
      <li>Anonymous device and crash diagnostics, used to improve app stability.</li>
    </ul>

    <h2 style="margin-top: var(--space-2xl);">How we use your data</h2>
    <p>We use the data above to operate the prediction game: rendering leaderboards, calculating scores, displaying league memberships, and providing customer support when you contact us.</p>
    <p>We do not sell your personal data. We do not use it for advertising.</p>

    <h2 style="margin-top: var(--space-2xl);">Where data is stored</h2>
    <p>Your data is stored with Supabase (our backend provider) in the European Union, and with Sanity (our content CMS) for the read-only competition data such as round names and dates. Both providers are GDPR-compliant.</p>

    <h2 style="margin-top: var(--space-2xl);">Your rights</h2>
    <p>You can request a copy of your data, correct it, or delete it at any time by emailing <a href="mailto:{{ site.supportEmail }}">{{ site.supportEmail }}</a>. See the <a href="/data-deletion/">Data Deletion</a> page for the deletion process.</p>

    <h2 style="margin-top: var(--space-2xl);">Cookies and analytics</h2>
    <p>This website uses Cloudflare Web Analytics to count page visits. It sets no cookies, collects no personally identifiable information, and does not track you across sites. The mobile app does not use third-party analytics or advertising SDKs.</p>

    <h2 style="margin-top: var(--space-2xl);">Changes to this policy</h2>
    <p>We'll update this page if our practices change, with the "Last updated" date at the top.</p>

    <h2 style="margin-top: var(--space-2xl);">Contact</h2>
    <p>Questions? Email <a href="mailto:{{ site.supportEmail }}">{{ site.supportEmail }}</a>.</p>
  </div>
</section>
```

- [ ] **Step 2: Create `src/terms.njk`**

```njk
---
layout: layouts/base.njk
title: Terms of Service
description: Terms of service for PipeBandPredictor.
permalink: /terms/
---

<section class="section">
  <div class="container" style="max-width: var(--content-max);">
    <span class="label">Legal</span>
    <h1 style="margin-top: var(--space-sm);">Terms of Service</h1>
    <p class="hero__lead">Last updated: 3 May 2026.</p>

    <h2 style="margin-top: var(--space-2xl);">1. Agreement</h2>
    <p>By using PipeBandPredictor (the "app") you agree to these terms. If you don't agree, please don't use the app.</p>

    <h2 style="margin-top: var(--space-2xl);">2. The service</h2>
    <p>PipeBandPredictor is a free prediction game for Grade 1 pipe band championships. We may add, change, or remove features at any time.</p>

    <h2 style="margin-top: var(--space-2xl);">3. Your account</h2>
    <p>You're responsible for keeping your sign-in credentials safe and for any activity under your account. We may suspend or close accounts that violate these terms or that are used abusively.</p>

    <h2 style="margin-top: var(--space-2xl);">4. Acceptable use</h2>
    <p>Don't use the app to harass other users, exploit bugs to cheat the leaderboard, or attempt to access another user's account.</p>

    <h2 style="margin-top: var(--space-2xl);">5. Content</h2>
    <p>Information about pipe band contests and bands within the app is provided for entertainment. We do our best to keep results accurate, but we can't guarantee no errors. Official competition results are issued by the RSPBA and contest organisers.</p>

    <h2 style="margin-top: var(--space-2xl);">6. No liability</h2>
    <p>The app is provided "as is" without warranty. To the extent permitted by law, Surface Development is not liable for any losses arising from use of the app.</p>

    <h2 style="margin-top: var(--space-2xl);">7. Governing law</h2>
    <p>These terms are governed by the laws of England and Wales.</p>

    <h2 style="margin-top: var(--space-2xl);">8. Contact</h2>
    <p>Questions? Email <a href="mailto:{{ site.supportEmail }}">{{ site.supportEmail }}</a>.</p>
  </div>
</section>
```

- [ ] **Step 3: Create `src/data-deletion.njk`**

```njk
---
layout: layouts/base.njk
title: Data Deletion
description: How to delete your PipeBandPredictor account and personal data.
permalink: /data-deletion/
---

<section class="section">
  <div class="container" style="max-width: var(--content-max);">
    <span class="label">Legal</span>
    <h1 style="margin-top: var(--space-sm);">Delete your data</h1>
    <p class="hero__lead">You can request the permanent deletion of your PipeBandPredictor account and personal data at any time.</p>

    <h2 style="margin-top: var(--space-2xl);">How to request deletion</h2>
    <p>Send an email to <a href="mailto:{{ site.supportEmail }}">{{ site.supportEmail }}</a> from the email address associated with your account, with the subject line <strong>"Delete my account"</strong>.</p>

    <h2 style="margin-top: var(--space-2xl);">What gets deleted</h2>
    <ul style="list-style: disc; padding-left: var(--space-xl); color: var(--color-text-muted);">
      <li>Your profile (name, email, profile photo).</li>
      <li>All predictions you've ever made.</li>
      <li>Your league memberships.</li>
      <li>Your accumulated scores and leaderboard positions.</li>
    </ul>
    <p>Anonymous, aggregated statistics that do not identify you may be retained.</p>

    <h2 style="margin-top: var(--space-2xl);">How long it takes</h2>
    <p>We'll confirm deletion within 30 days. In most cases it's done within 5 working days. We'll send a confirmation email when complete.</p>

    <h2 style="margin-top: var(--space-2xl);">Other questions</h2>
    <p>For other privacy-related questions, see the <a href="/privacy/">Privacy Policy</a> or contact us.</p>
  </div>
</section>
```

- [ ] **Step 4: Build and verify**

Run: `npm test`
Expected: PASS — `_site/privacy/index.html`, `_site/terms/index.html`, `_site/data-deletion/index.html` all present.

- [ ] **Step 5: Commit**

```bash
git add src/privacy.njk src/terms.njk src/data-deletion.njk
git commit -m "feat: add self-hosted Privacy, Terms, and Data Deletion pages"
```

---

## Task 16: 404 page + sitemap + robots integration

**Files:**
- Create: `src/404.njk`
- Create: `src/sitemap.njk`
- Modify: `.eleventy.js` (no plugin needed — handcraft sitemap with the eleventy collection)

- [ ] **Step 1: Create `src/404.njk`**

```njk
---
layout: layouts/base.njk
title: Not found
description: The page you're looking for doesn't exist.
permalink: /404.html
eleventyExcludeFromCollections: true
---

<section class="section">
  <div class="container" style="text-align: center; max-width: var(--content-max);">
    <span class="label">404</span>
    <h1 style="margin-top: var(--space-sm);">We couldn't find that page.</h1>
    <p class="hero__lead">It may have moved, or the link may be wrong.</p>
    <p style="margin-top: var(--space-xl);">
      <a href="/" class="btn btn--primary">Back to home</a>
    </p>
  </div>
</section>
```

- [ ] **Step 2: Create `src/sitemap.njk`**

```njk
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
layout: false
---
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{%- for page in collections.all %}
  {%- if page.url and page.data.eleventyExcludeFromCollections !== true %}
  {%- if "/invite/" not in page.url and "/.well-known/" not in page.url and ".html" not in page.url and ".xml" not in page.url %}
  <url>
    <loc>{{ site.url }}{{ page.url }}</loc>
    <lastmod>{{ page.date | date: "%Y-%m-%d" }}</lastmod>
  </url>
  {%- endif %}
  {%- endif %}
{%- endfor %}
</urlset>
```

- [ ] **Step 3: Add a build assertion for sitemap and 404**

Append to `tests/build.test.js`:

```js
  it('produces a sitemap with all primary pages', () => {
    const xml = readFileSync('_site/sitemap.xml', 'utf-8');
    expect(xml).toContain('https://pipebandpredictor.com/');
    expect(xml).toContain('https://pipebandpredictor.com/how-it-works/');
    expect(xml).toContain('https://pipebandpredictor.com/faq/');
    expect(xml).toContain('https://pipebandpredictor.com/support/');
    expect(xml).toContain('https://pipebandpredictor.com/privacy/');
    expect(xml).not.toContain('/invite/');
  });

  it('produces a 404 page', () => {
    expect(existsSync('_site/404.html')).toBe(true);
  });
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: PASS — all build assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/404.njk src/sitemap.njk tests/build.test.js
git commit -m "feat: add 404 page and sitemap.xml generated from collections"
```

---

## Task 17: Invite landing JS (TDD with happy-dom)

**Files:**
- Create: `tests/invite.test.js`
- Create: `src/assets/js/invite.js`

- [ ] **Step 1: Switch test environment for invite.js to happy-dom**

Modify `vitest.config.js` to allow per-file environment overrides via comment:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['tests/invite.test.js', 'happy-dom'],
    ],
    include: ['tests/**/*.test.js'],
    testTimeout: 60_000,
  },
});
```

- [ ] **Step 2: Write failing tests for invite.js**

Create `tests/invite.test.js`:

```js
/** @vitest-environment happy-dom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractCode, detectPlatform, renderInvite } from '../src/assets/js/invite.js';

describe('extractCode', () => {
  it('extracts a 7-character alphanumeric code from /invite/<code>', () => {
    expect(extractCode('/invite/ABC1234')).toBe('ABC1234');
  });

  it('returns null for missing or malformed paths', () => {
    expect(extractCode('/invite/')).toBe(null);
    expect(extractCode('/invite')).toBe(null);
    expect(extractCode('/invite/abc')).toBe(null);
    expect(extractCode('/invite/TOOLONGCODE')).toBe(null);
    expect(extractCode('/invite/HAS-DASH')).toBe(null);
  });

  it('handles trailing slashes', () => {
    expect(extractCode('/invite/ABC1234/')).toBe('ABC1234');
  });

  it('uppercases the code', () => {
    expect(extractCode('/invite/abc1234')).toBe('ABC1234');
  });
});

describe('detectPlatform', () => {
  it('detects iOS from a typical iPhone UA', () => {
    expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15')).toBe('ios');
  });

  it('detects iOS from an iPad UA', () => {
    expect(detectPlatform('Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15')).toBe('ios');
  });

  it('detects Android', () => {
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36')).toBe('android');
  });

  it('returns "other" for desktop browsers', () => {
    expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15')).toBe('other');
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36')).toBe('other');
  });
});

describe('renderInvite', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-invite-code></div>
      <button data-invite-copy>Copy</button>
      <span data-invite-status></span>
      <a data-invite-cta="ios" href="#">App Store</a>
      <a data-invite-cta="android" href="#">Play Store</a>
    `;
  });

  it('shows the code when valid', () => {
    renderInvite({ pathname: '/invite/ABC1234', userAgent: 'iPhone' });
    expect(document.querySelector('[data-invite-code]').textContent).toBe('ABC1234');
  });

  it('hides the code element when no valid code', () => {
    renderInvite({ pathname: '/invite/', userAgent: 'iPhone' });
    const el = document.querySelector('[data-invite-code]');
    expect(el.hidden).toBe(true);
  });

  it('marks the iOS CTA active on iPhone', () => {
    renderInvite({ pathname: '/invite/ABC1234', userAgent: 'iPhone' });
    const ios = document.querySelector('[data-invite-cta="ios"]');
    expect(ios.classList.contains('btn--primary')).toBe(true);
  });

  it('marks the Android CTA active on Android', () => {
    renderInvite({ pathname: '/invite/ABC1234', userAgent: 'Android' });
    const android = document.querySelector('[data-invite-cta="android"]');
    expect(android.classList.contains('btn--primary')).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- tests/invite.test.js`
Expected: FAIL — module doesn't exist.

- [ ] **Step 4: Implement `src/assets/js/invite.js`**

```js
const CODE_RE = /^[A-Z0-9]{7}$/;

export function extractCode(pathname) {
  if (!pathname) return null;
  const m = pathname.match(/^\/invite\/([^/?#]+)\/?$/);
  if (!m) return null;
  const candidate = m[1].toUpperCase();
  return CODE_RE.test(candidate) ? candidate : null;
}

export function detectPlatform(userAgent = '') {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  return 'other';
}

export function renderInvite({ pathname, userAgent }) {
  const code = extractCode(pathname);
  const platform = detectPlatform(userAgent);

  const codeEl = document.querySelector('[data-invite-code]');
  const copyBtn = document.querySelector('[data-invite-copy]');
  const statusEl = document.querySelector('[data-invite-status]');
  const iosCta = document.querySelector('[data-invite-cta="ios"]');
  const androidCta = document.querySelector('[data-invite-cta="android"]');

  if (codeEl) {
    if (code) {
      codeEl.textContent = code;
      codeEl.hidden = false;
    } else {
      codeEl.hidden = true;
    }
  }

  if (iosCta && platform === 'ios') {
    iosCta.classList.remove('btn--ghost');
    iosCta.classList.add('btn--primary');
  }
  if (androidCta && platform === 'android') {
    androidCta.classList.remove('btn--ghost');
    androidCta.classList.add('btn--primary');
  }

  if (copyBtn && code && navigator.clipboard) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
        if (statusEl) statusEl.textContent = 'Code copied!';
      } catch {
        if (statusEl) statusEl.textContent = 'Press to copy didn\'t work — long-press the code instead.';
      }
    });
  } else if (copyBtn && !code) {
    copyBtn.hidden = true;
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    renderInvite({
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
    });
  });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- tests/invite.test.js`
Expected: PASS — all tests green.

- [ ] **Step 6: Commit**

```bash
git add tests/invite.test.js src/assets/js/invite.js vitest.config.js
git commit -m "feat: add invite.js with TDD-driven code extraction, platform detection, and DOM rendering"
```

---

## Task 18: Invite landing template + AASA + assetlinks

**Files:**
- Create: `src/invite/index.njk`
- Create: `src/.well-known/apple-app-site-association`
- Create: `src/.well-known/assetlinks.json`

- [ ] **Step 1: Create `src/invite/index.njk`**

```njk
---
layout: layouts/base.njk
title: Join a league
description: You've been invited to a PipeBandPredictor league. Get the app to join.
permalink: /invite/index.html
eleventyExcludeFromCollections: true
---

<section class="invite">
  <div class="invite__card">
    <span class="label">League invite</span>
    <h1 style="font-size: 1.5rem; margin-top: var(--space-sm);">Join the league.</h1>
    <p>You've been invited to a private league in {{ site.name }}.</p>

    <p style="margin-top: var(--space-lg);">Your invite code:</p>
    <div data-invite-code class="invite__code" hidden></div>
    <button data-invite-copy class="btn btn--ghost" type="button">Copy code</button>
    <p class="invite__copy-status" data-invite-status></p>

    <hr style="border: 0; border-top: 1px solid var(--color-border); margin: var(--space-2xl) 0;">

    <h2 style="font-size: 1.125rem;">Don't have the app yet?</h2>
    <p style="font-size: 0.9375rem; margin-top: var(--space-sm);">Download {{ site.name }} below, then enter your invite code in the Leagues tab.</p>

    <div class="hero__ctas" style="justify-content: center; margin-top: var(--space-lg);">
      {% if site.appStore.iosAvailable %}
        <a data-invite-cta="ios" href="{{ site.appStore.ios }}" class="btn btn--ghost" rel="noopener">App Store</a>
      {% else %}
        <span data-invite-cta="ios" class="btn btn--ghost" aria-disabled="true">App Store · soon</span>
      {% endif %}
      {% if site.appStore.androidAvailable %}
        <a data-invite-cta="android" href="{{ site.appStore.android }}" class="btn btn--ghost" rel="noopener">Play Store</a>
      {% else %}
        <span data-invite-cta="android" class="btn btn--ghost" aria-disabled="true">Play Store · soon</span>
      {% endif %}
    </div>
  </div>
</section>

{% block extraScripts %}
<script type="module" src="/assets/js/invite.js"></script>
{% endblock %}
```

- [ ] **Step 2: Create `src/.well-known/apple-app-site-association`** (no extension!)

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

- [ ] **Step 3: Create `src/.well-known/assetlinks.json`**

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.pipebandpredictor.app",
      "sha256_cert_fingerprints": [
        "REPLACE_WITH_UPLOAD_KEY_SHA256",
        "REPLACE_WITH_APP_SIGNING_KEY_SHA256"
      ]
    }
  }
]
```

- [ ] **Step 4: Add build assertion for `.well-known` files**

Append to `tests/build.test.js`:

```js
  it('publishes apple-app-site-association at /.well-known/', () => {
    const path = '_site/.well-known/apple-app-site-association';
    expect(existsSync(path)).toBe(true);
    const json = JSON.parse(readFileSync(path, 'utf-8'));
    expect(json.applinks.details[0].appID).toBe('2DGK7F9D85.com.surfacedevelopment.pipebandpredictor');
    expect(json.applinks.details[0].paths).toContain('/invite/*');
  });

  it('publishes assetlinks.json at /.well-known/', () => {
    const path = '_site/.well-known/assetlinks.json';
    expect(existsSync(path)).toBe(true);
    const json = JSON.parse(readFileSync(path, 'utf-8'));
    expect(json[0].target.package_name).toBe('com.pipebandpredictor.app');
  });

  it('produces invite landing at /invite/index.html', () => {
    expect(existsSync('_site/invite/index.html')).toBe(true);
    const html = readFileSync('_site/invite/index.html', 'utf-8');
    expect(html).toContain('data-invite-code');
  });
```

- [ ] **Step 5: Run all tests**

Run: `npm test`
Expected: PASS — every assertion green.

- [ ] **Step 6: Commit**

```bash
git add src/invite/ src/.well-known/ tests/build.test.js
git commit -m "feat: add invite landing template, AASA, and assetlinks.json"
```

---

## Task 19: Cloudflare Web Analytics + JSON-LD on homepage

**Files:**
- Modify: `src/_data/site.json` (add cloudflareAnalyticsToken field)
- Modify: `src/_includes/partials/head.njk` (inject CF analytics + JSON-LD slot)
- Modify: `src/index.njk` (add JSON-LD)

- [ ] **Step 1: Add field to `src/_data/site.json`**

Update `site.json` to include:

```json
{
  "name": "Pipe Band Predictor",
  "shortName": "PipeBandPredictor",
  "tagline": "The prediction game for Grade 1 pipe band championships.",
  "url": "https://pipebandpredictor.com",
  "themeColor": "#3C8CCA",
  "supportEmail": "support@surfacedevelopment.co.uk",
  "company": "Surface Development",
  "companyUrl": "https://surfacedevelopment.co.uk",
  "appStore": {
    "ios": "https://apps.apple.com/gb/app/pipe-band-predictor/id6758277252",
    "iosAvailable": true,
    "android": null,
    "androidAvailable": false
  },
  "ogImage": "/assets/img/og/pipe-band-predictor.png",
  "cloudflareAnalyticsToken": ""
}
```

The empty token ships safely; once Cloudflare Pages auto-injection is enabled in the project settings, no manual token is needed and this field can stay blank. Provided here for explicit-control fallback.

- [ ] **Step 2: Append analytics + JSON-LD slot to `src/_includes/partials/head.njk`**

Replace the file with:

```njk
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{% if title %}{{ title }} – {{ site.name }}{% else %}{{ site.name }}{% endif %}</title>
<meta name="description" content="{{ description or site.tagline }}">
<meta name="theme-color" content="{{ site.themeColor }}">

<link rel="canonical" href="{{ site.url }}{{ page.url }}">

<link rel="icon" href="/assets/img/icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/icons/apple-touch-icon.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/base.css">
<link rel="stylesheet" href="/assets/css/components.css">

{% include "partials/og.njk" %}

{% block jsonLd %}{% endblock %}

{% if site.cloudflareAnalyticsToken %}
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "{{ site.cloudflareAnalyticsToken }}"}'></script>
{% endif %}
```

- [ ] **Step 3: Add JSON-LD SoftwareApplication to homepage**

Insert near the top of `src/index.njk` (just after the front-matter, before the first section):

```njk
{% block jsonLd %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{{ site.name }}",
  "description": "{{ site.tagline }}",
  "applicationCategory": "SportsApplication",
  "operatingSystem": "iOS, Android",
  "url": "{{ site.url }}",
  "installUrl": "{{ site.appStore.ios }}",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
  "author": { "@type": "Organization", "name": "{{ site.company }}", "url": "{{ site.companyUrl }}" }
}
</script>
{% endblock %}
```

- [ ] **Step 4: Update build smoke test**

Append to `tests/build.test.js`:

```js
  it('includes JSON-LD on homepage', () => {
    const html = readFileSync('_site/index.html', 'utf-8');
    expect(html).toContain('"@type": "SoftwareApplication"');
    expect(html).toContain('"installUrl": "https://apps.apple.com/gb/app/pipe-band-predictor/id6758277252"');
  });
```

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/_data/site.json src/_includes/partials/head.njk src/index.njk tests/build.test.js
git commit -m "feat: add Cloudflare analytics hook and SoftwareApplication JSON-LD"
```

---

## Task 20: README + deploy documentation

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with quick start, env vars, and Cloudflare Pages deploy guide"
```

---

## Task 21: Pre-launch checklist + final smoke

**Files:**
- Create: `docs/PRE_LAUNCH_CHECKLIST.md`

- [ ] **Step 1: Run the full test suite one last time**

Run: `npm test`
Expected: PASS — every test in `tests/` green.

- [ ] **Step 2: Run `npm run build` and inspect the output manually**

```bash
npm run clean && npm run build
ls -la _site/
ls -la _site/.well-known/
```

Confirm: every page from the IA renders, `.well-known/apple-app-site-association` exists with no extension, `_headers` and `_redirects` are at the root of `_site/`.

- [ ] **Step 3: Create `docs/PRE_LAUNCH_CHECKLIST.md`**

```markdown
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
```

- [ ] **Step 4: Commit**

```bash
git add docs/PRE_LAUNCH_CHECKLIST.md
git commit -m "docs: add pre-launch checklist covering code, hosting, deep links, and store listings"
```

---

## Self-review — coverage matrix

Mapping spec sections (`docs/superpowers/specs/2026-05-03-pipebandpredictor-marketing-site-design.md`) to plan tasks:

| Spec § | Topic | Covered by |
|---|---|---|
| §3 Architecture, §10 Build & deploy | Eleventy + npm scripts + Node version | Task 1, 2, 20 |
| §4 Repository layout | Full directory structure | Task 1 (root files), Tasks 2, 4–9 (src/), Task 10 (data), Tasks 11–18 (pages) |
| §5 Site map | Every URL | Task 11 (`/`), 12 (`/how-it-works/`), 13 (`/faq/`), 14 (`/support/`), 15 (legal), 16 (404+sitemap), 18 (invite + .well-known) |
| §6 Visual design tokens | tokens.css, base.css, components.css | Task 4, 5, 6 |
| §6 Typography (Poppins) | Google Fonts link | Task 7 (head.njk) |
| §7 Page content outlines | All 7 pages + 404 | Tasks 11–16 |
| §8 Sanity build-time fetch | schedule.js + tests + env-var doc | Task 10, 20 (README), 21 (checklist) |
| §9.1 AASA file | apple-app-site-association | Task 18 |
| §9.2 assetlinks.json | assetlinks.json | Task 18 |
| §9.3 Invite landing template | /invite/index.njk + invite.js + _redirects | Task 17 (JS), 18 (template), 3 (_redirects) |
| §9.4 App config update | Documented as deferred user task | Task 20 (README), 21 (checklist) |
| §10 _headers, _redirects | Static config files | Task 3 |
| §11 Analytics | Cloudflare Web Analytics hook | Task 19, 20 |
| §11 SEO | OG, JSON-LD, sitemap, robots, security headers | Task 7 (OG), 19 (JSON-LD), 16 (sitemap), 3 (robots, headers) |
| §12 Out of scope | Not implemented (correct) | — |
| §13 Dependencies / handoffs | Documented for user | Task 20 (README), 21 (checklist) |
| §14 Cutover sequence | Documented | Task 21 |
| §15 Risks & open questions | Documented in README + checklist | Task 20, 21 |

**Placeholder scan:** No `TODO`/`TBD`/`fill in later` entries. The two intentional placeholders (`REPLACE_WITH_UPLOAD_KEY_SHA256`, `REPLACE_WITH_APP_SIGNING_KEY_SHA256`) are flagged in the README and checklist as user inputs — same status as in the spec.

**Type / signature consistency:** `extractCode`, `detectPlatform`, `renderInvite` signatures match across the test file (Task 17 Step 2) and implementation (Task 17 Step 4). Schedule data shape (`{_id, name, roundType, eventDate, isMajor}`) is consistent between Task 10's implementation and Task 11's homepage template consumer.

**Spec gaps:** None — every spec section has at least one corresponding task.
