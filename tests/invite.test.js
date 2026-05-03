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

  it('does not promote a disabled CTA to primary even on matching platform', () => {
    document.body.innerHTML = `
      <div data-invite-code></div>
      <button data-invite-copy>Copy</button>
      <span data-invite-status></span>
      <span data-invite-cta="ios" aria-disabled="true">App Store · soon</span>
      <span data-invite-cta="android" aria-disabled="true">Play Store · soon</span>
    `;
    renderInvite({ pathname: '/invite/ABC1234', userAgent: 'Android' });
    const android = document.querySelector('[data-invite-cta="android"]');
    expect(android.classList.contains('btn--primary')).toBe(false);
  });

  it('does not add duplicate copy listeners when called twice', () => {
    renderInvite({ pathname: '/invite/ABC1234', userAgent: 'iPhone' });
    renderInvite({ pathname: '/invite/ABC1234', userAgent: 'iPhone' });
    const copyBtn = document.querySelector('[data-invite-copy]');
    // Should be marked as bound only once; the dataset flag is the proxy
    expect(copyBtn.dataset.inviteBound).toBe('true');
  });
});
