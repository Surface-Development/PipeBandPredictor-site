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

  if (copyBtn && code && navigator.clipboard && !copyBtn.dataset.inviteBound) {
    copyBtn.dataset.inviteBound = 'true';
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
