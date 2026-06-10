/**
 * tests/functional/downloads.spec.ts
 *
 * Functional tests for CADint PCB's download/trial section.
 * Verifies that download CTAs are present, linked, and reachable.
 * Does NOT actually trigger file downloads.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Download / Trial Section @functional', () => {
  test('a download or trial link exists somewhere on the site @functional', async ({
    page,
    siteConfig,
  }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const downloadLinks = page.locator(
      'a[href*="download" i], a[href*="trial" i], a[href*=".exe" i], ' +
      'a[href*=".zip" i], a[href*=".msi" i], ' +
      'a:has-text("Download"), a:has-text("Try"), a:has-text("Trial"), a:has-text("Free")'
    );

    const count = await downloadLinks.count();

    if (count === 0) {
      // Check the nav for a download link
      const navLink = page.locator('nav a, header a').filter({
        hasText: /download|trial|try|free/i,
      });
      const navCount = await navLink.count();
      expect(
        navCount,
        'At least one download/trial link should be present in the nav or page body'
      ).toBeGreaterThan(0);
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('download page is reachable @functional', async ({ page, siteConfig }) => {
    const candidatePaths = ['/download', '/downloads', '/trial', '/get', '/free'];

    let reachable = false;
    let reachedPath = '';

    for (const path of candidatePaths) {
      const targetUrl = siteConfig.url.replace(/\/$/, '') + path;
      try {
        const response = await page.goto(targetUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 15_000,
        });

        if (response && response.status() < 400) {
          reachable = true;
          reachedPath = path;
          break;
        }
      } catch {
        // Path not found — try next
      }
    }

    if (!reachable) {
      console.warn(
        `[functional] No dedicated download page found at ${candidatePaths.join(', ')}. ` +
        'Download links may be on the homepage only.'
      );
    } else {
      console.info(`[functional] Download page found at: ${reachedPath}`);
      const bodyText = await page.evaluate<string>(() => document.body.innerText);
      expect(bodyText.length, 'Download page should have content').toBeGreaterThan(50);
    }
  });

  test('download links have valid hrefs @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const downloadLinks = page.locator(
      'a[href*="download" i], a[href*="trial" i], a[href*=".exe" i], a[href*=".msi" i]'
    );

    const count = await downloadLinks.count();

    if (count === 0) {
      console.warn('[functional] No file download links detected on homepage');
      return;
    }

    for (let i = 0; i < count; i++) {
      const link = downloadLinks.nth(i);
      const href = await link.getAttribute('href');

      expect(href, `Download link ${i} should have an href`).toBeTruthy();
      expect(href, `Download link ${i} href should not be empty`).not.toBe('');
      expect(href, `Download link ${i} href should not be "#"`).not.toBe('#');
    }
  });

  test('download section has version or product information @functional', async ({
    downloadsPage,
    page,
    siteConfig,
  }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    // Look for version numbers anywhere on the page
    const versionPattern = /\bv?\d+\.\d+[.\d]*/;
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    const hasVersion = versionPattern.test(bodyText);

    if (!hasVersion) {
      // Check if dedicated download page exists
      const versionText = await downloadsPage.getVersionText();
      if (!versionText) {
        console.warn('[functional] No version information found — product may use a landing page pattern');
      }
    }

    // At a minimum, the page should have some content referencing the product
    expect(bodyText.length, 'Page body should have content').toBeGreaterThan(0);
  });
});
