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

  it('includes JSON-LD on homepage', () => {
    const html = readFileSync('_site/index.html', 'utf-8');
    expect(html).toContain('"@type": "SoftwareApplication"');
    expect(html).toContain('"installUrl": "https://apps.apple.com/gb/app/pipe-band-predictor/id6758277252"');
  });
});
