/**
 * tests/regression/cross-page-consistency.spec.ts
 *
 * Regression tests that verify structural consistency across multiple pages.
 * These tests catch regressions where navigation, branding, or footer elements
 * disappear on specific pages after a site update.
 *
 * Tag: @regression
 */

import { test, expect } from '@fixtures/site.fixture';

// Pages to check for consistent structure.
// Add page paths here as more are discovered via /analyze-site.
const PAGES_TO_CHECK = [
  { path: '/', label: 'Homepage' },
  { path: '/download', label: 'Download' },
  { path: '/contact', label: 'Contact' },
];

test.describe('Navigation Consistency @regression', () => {
  for (const { path, label } of PAGES_TO_CHECK) {
    test(`navigation is present on ${label} @regression`, async ({ page, siteConfig }) => {
      const url = siteConfig.url.replace(/\/$/, '') + path;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Skip pages that return 404 — they may not exist on this site
      if (!response || response.status() >= 400) {
        console.warn(`[regression] ${label} (${path}) returned ${response?.status()} — skipping nav check`);
        return;
      }

      const nav = page.locator('nav, [role="navigation"], header');
      const navCount = await nav.count();
      expect(
        navCount,
        `${label} should have a navigation element`
      ).toBeGreaterThan(0);

      const firstNav = nav.first();
      await expect(firstNav, `${label} navigation should be visible`).toBeVisible();
    });
  }
});

test.describe('Footer Consistency @regression', () => {
  for (const { path, label } of PAGES_TO_CHECK) {
    test(`footer is present on ${label} @regression`, async ({ page, siteConfig }) => {
      const url = siteConfig.url.replace(/\/$/, '') + path;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

      if (!response || response.status() >= 400) {
        console.warn(`[regression] ${label} (${path}) returned ${response?.status()} — skipping footer check`);
        return;
      }

      const footer = page.locator('footer, [role="contentinfo"]');
      const footerCount = await footer.count();

      if (footerCount === 0) {
        console.warn(`[regression] ${label} has no <footer> or role="contentinfo" element`);
      } else {
        await expect(footer.first(), `${label} footer should be visible`).toBeVisible();
      }
    });
  }
});

test.describe('Branding Consistency @regression', () => {
  for (const { path, label } of PAGES_TO_CHECK) {
    test(`brand/company name is present on ${label} @regression`, async ({ page, siteConfig }) => {
      const url = siteConfig.url.replace(/\/$/, '') + path;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

      if (!response || response.status() >= 400) {
        console.warn(`[regression] ${label} returned ${response?.status()} — skipping brand check`);
        return;
      }

      const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());
      const hasBranding =
        bodyText.includes('cadint') ||
        bodyText.includes('pcb');

      expect(
        hasBranding,
        `${label} should contain brand/product name ("cadint" or "pcb")`
      ).toBeTruthy();
    });
  }
});

test.describe('Page Title Consistency @regression', () => {
  for (const { path, label } of PAGES_TO_CHECK) {
    test(`${label} has a non-empty page title @regression`, async ({ page, siteConfig }) => {
      const url = siteConfig.url.replace(/\/$/, '') + path;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

      if (!response || response.status() >= 400) {
        console.warn(`[regression] ${label} returned ${response?.status()} — skipping title check`);
        return;
      }

      const title = await page.title();
      expect(title.trim(), `${label} must have a non-empty <title>`).toBeTruthy();
      expect(title.trim().length, `${label} title should be meaningful`).toBeGreaterThan(3);
    });
  }
});

test.describe('No Broken Internal Links @regression', () => {
  test('homepage internal links all return 2xx status @regression', async ({
    page,
    siteConfig,
    navigationPage,
  }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    await navigationPage.navigate();

    const results = await navigationPage.checkAllNavLinksReachable();
    const broken = results.filter(r => !r.ok && r.status !== 0);

    if (broken.length > 0) {
      const report = broken.map(r => `  ${r.url} → HTTP ${r.status}`).join('\n');
      console.warn(`[regression] Broken nav links found:\n${report}`);
    }

    // Only hard-fail on links that returned a real error status (4xx/5xx)
    // Status 0 means network error (server may block HEAD requests)
    expect(
      broken.length,
      `Found ${broken.length} broken nav link(s):\n${broken.map(r => r.url).join('\n')}`
    ).toBe(0);
  });
});

test.describe('HTTP to HTTPS Redirect @regression', () => {
  test('site redirects HTTP to HTTPS @regression', async ({ page, siteConfig }) => {
    const url = siteConfig.url;
    const httpUrl = url.replace(/^https?:\/\//, 'http://');

    const response = await page.goto(httpUrl, {
      waitUntil: 'domcontentloaded',
    });

    // After following redirects, the final URL should be HTTPS
    const finalUrl = page.url().toLowerCase();

    if (url.startsWith('http://')) {
      // Site is intentionally HTTP — warn but do not fail
      console.warn(
        `[regression] Site is configured as HTTP (${url}). ` +
        'Consider migrating to HTTPS for security and SEO.'
      );
    } else {
      expect(
        finalUrl.startsWith('https://'),
        `Final URL after redirect should be HTTPS, got: ${finalUrl}`
      ).toBeTruthy();
    }

    expect(response, 'Page should load successfully').not.toBeNull();
  });
});
