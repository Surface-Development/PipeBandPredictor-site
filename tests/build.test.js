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
});
