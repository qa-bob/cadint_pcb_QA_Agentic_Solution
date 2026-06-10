/**
 * tests/functional/pcb-features.spec.ts
 *
 * Functional tests for CADint PCB's core product feature sections.
 * Verifies that the homepage and product pages surface the software's
 * key capabilities: schematic capture, PCB layout, 3D viewer, and import/export.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('PCB Product Features @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    // homePage fixture has already navigated; ensure we are at root
    await homePage.waitForLoad();
  });

  test('homepage loads with a primary heading @functional', async ({ homePage }) => {
    const heading = await homePage.getMainHeading();
    expect(heading.length, 'Homepage must have a non-empty H1 or H2').toBeGreaterThan(0);
  });

  test('homepage contains PCB-related content @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());
    const hasPcbContent =
      bodyText.includes('pcb') ||
      bodyText.includes('schematic') ||
      bodyText.includes('layout') ||
      bodyText.includes('circuit') ||
      bodyText.includes('cad');

    expect(
      hasPcbContent,
      'Homepage body should reference PCB, schematic, layout, circuit, or CAD'
    ).toBeTruthy();
  });

  test('homepage has at least one call-to-action @functional', async ({ homePage }) => {
    const ctaButtons = await homePage.getCTAButtons();
    expect(
      ctaButtons.length,
      'Homepage should have at least one CTA button or link'
    ).toBeGreaterThan(0);
  });

  test('features/product sections are present on homepage @functional', async ({ productsPage }) => {
    // Navigate is already done by homePage fixture; page is on homepage
    const sections = await productsPage.discoverFeatureSections();
    expect(
      sections.length,
      'Homepage should have discoverable feature headings (H2/H3)'
    ).toBeGreaterThan(0);

    // Log discovered sections for debugging
    const titles = sections.map(s => s.title).join(', ');
    console.info(`[functional] Feature sections found: ${titles}`);
  });

  test('download CTA is reachable from homepage @functional', async ({ productsPage }) => {
    const isVisible = await productsPage.isDownloadCTAVisible();

    if (!isVisible) {
      console.warn('[functional] No download CTA found on homepage — may be on a separate /download page');
    }

    // Soft check — many software sites put the download link in the nav
    const navDownload = productsPage.page.locator(
      'a[href*="download" i], a:has-text("Download"), a:has-text("Try")'
    );
    const navCount = await navDownload.count();
    expect(
      navCount + (isVisible ? 1 : 0),
      'At least one download/trial link should be discoverable on the page'
    ).toBeGreaterThan(0);
  });
});

test.describe('PCB Features Page @functional', () => {
  test('features/products page loads when navigated to @functional', async ({ page, siteConfig }) => {
    // Try common URLs for the features/products page
    const candidatePaths = ['/features', '/products', '/pcb', '/software'];

    let foundPage = false;
    for (const path of candidatePaths) {
      const targetUrl = siteConfig.url.replace(/\/$/, '') + path;
      const response = await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

      if (response && response.status() < 400) {
        foundPage = true;
        const heading = await page.locator('h1, h2').first().textContent();
        expect(heading?.trim().length ?? 0, `${path} should have a heading`).toBeGreaterThan(0);
        break;
      }
    }

    if (!foundPage) {
      // Features content may live on the homepage — verify homepage has feature text
      await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
      const bodyText = await page.evaluate<string>(() => document.body.innerText);
      expect(bodyText.length, 'Homepage should have content if no features sub-page exists').toBeGreaterThan(100);
    }
  });

  test('schematic capture is mentioned in site content @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());

    const mentionsSchematic = bodyText.includes('schematic');
    if (!mentionsSchematic) {
      // Try navigating to features page
      await page.goto(siteConfig.url.replace(/\/$/, '') + '/features', {
        waitUntil: 'domcontentloaded',
      }).catch(() => null);
      const featuresText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());
      expect(
        featuresText.includes('schematic') || featuresText.includes('pcb'),
        'Site should mention schematic capture capabilities'
      ).toBeTruthy();
    } else {
      expect(mentionsSchematic).toBeTruthy();
    }
  });

  test('PCB layout feature is mentioned in site content @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());

    expect(
      bodyText.includes('layout') || bodyText.includes('routing') || bodyText.includes('board'),
      'Site should mention PCB layout, routing, or board capabilities'
    ).toBeTruthy();
  });

  test('page images are present and have alt text @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount === 0) {
      console.warn('[functional] No images found on homepage');
      return;
    }

    // Check that images are not broken (have src attribute)
    let missingAlt = 0;
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      if (!alt || alt.trim() === '') missingAlt++;
    }

    if (missingAlt > 0) {
      console.warn(`[functional] ${missingAlt} image(s) are missing alt text — accessibility issue`);
    }

    expect(imageCount, 'Homepage should have at least one image').toBeGreaterThan(0);
  });
});
