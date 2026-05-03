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
