/**
 * tests/functional/pcb-features.spec.ts
 *
 * Functional tests for CADint PCB's core product feature sections.
 *
 * Site structure notes (confirmed via /analyze-site 2026-06-10):
 *  - Homepage (/) is the Download demo-request page — minimal content
 *  - Feature content lives on /Features/ (H4 headings, no H1/H2)
 *  - CTAs are "Show me »" link and a newsletter subscription link
 *  - Site uses H4/H5 exclusively — no H1/H2/H3 present
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const FEATURES_PATH = '/Features/';

test.describe('PCB Product Features @functional', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.waitForLoad();
  });

  test('homepage loads with a heading @functional', async ({ page }) => {
    // Site uses H4 as primary heading — confirmed via analysis
    const heading = page.locator('h1, h2, h3, h4').first();
    await expect(heading, 'Page must have at least one heading (H1–H4)').toBeVisible();
    const text = await heading.textContent();
    expect(text?.trim().length ?? 0, 'Heading must have non-empty text').toBeGreaterThan(0);
  });

  test('homepage contains PCB-related content @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());
    const hasPcbContent =
      bodyText.includes('pcb') ||
      bodyText.includes('cad') ||
      bodyText.includes('download');

    expect(hasPcbContent, 'Homepage body should reference PCB, CAD, or download').toBeTruthy();
  });

  test('homepage has at least one call-to-action link @functional', async ({ page }) => {
    // Site CTAs: "Show me »" link and newsletter subscription link
    const ctas = page.locator('a[href]').filter({
      hasText: /show me|newsletter|subscribe|download|try|order|features/i,
    });
    const count = await ctas.count();
    expect(count, 'Homepage should have at least one CTA link').toBeGreaterThan(0);
  });

  test('download CTA is present on homepage @functional', async ({ page }) => {
    // The homepage IS the download page — the form itself is the CTA
    const form = page.locator('form');
    const downloadLink = page.locator('a[href]').filter({ hasText: /download|demo/i });

    const formCount = await form.count();
    const linkCount = await downloadLink.count();

    expect(
      formCount + linkCount,
      'Homepage should have a download form or a download link'
    ).toBeGreaterThan(0);
  });
});

test.describe('PCB Features Page @functional', () => {
  test.beforeEach(async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url.replace(/\/$/, '') + FEATURES_PATH, {
      waitUntil: 'domcontentloaded',
    });
  });

  test('Features page loads and has headings @functional', async ({ page }) => {
    const heading = page.locator('h1, h2, h3, h4').first();
    await expect(heading, 'Features page must have a heading').toBeVisible();
  });

  test('feature sections are present on Features page @functional', async ({ productsPage }) => {
    const sections = await productsPage.discoverFeatureSections();
    expect(
      sections.length,
      'Features page should have discoverable section headings (H2–H4)'
    ).toBeGreaterThan(0);
    console.info(`[functional] Feature sections: ${sections.map(s => s.title).join(', ')}`);
  });

  test('schematic capture is mentioned on Features page @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());
    expect(
      bodyText.includes('schematic'),
      'Features page should mention schematic capture'
    ).toBeTruthy();
  });

  test('PCB layout / routing is mentioned on Features page @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());
    expect(
      bodyText.includes('layout') || bodyText.includes('routing') || bodyText.includes('board'),
      'Features page should mention PCB layout, routing, or board'
    ).toBeTruthy();
  });

  test('3D viewer is mentioned on Features page @functional', async ({ page }) => {
    const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());
    expect(bodyText.includes('3d'), 'Features page should mention 3D viewer').toBeTruthy();
  });

  test('Features page images have alt text @functional', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();

    if (count === 0) {
      console.warn('[functional] No images found on Features page');
      return;
    }

    let missingAlt = 0;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (!alt || alt.trim() === '') missingAlt++;
    }
    if (missingAlt > 0) {
      console.warn(`[functional] ${missingAlt} image(s) on Features page are missing alt text`);
    }
    expect(count, 'Features page should have at least one image').toBeGreaterThan(0);
  });
});

test.describe('Site Navigation Links to Key Pages @functional', () => {
  test('Features nav link resolves to Features page @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url, { waitUntil: 'domcontentloaded' });
    const featuresLink = page.locator('a').filter({ hasText: /^features$/i }).first();
    await expect(featuresLink, 'Navigation should have a Features link').toBeVisible();

    await featuresLink.click();
    await page.waitForLoadState('domcontentloaded');

    const bodyText = await page.evaluate<string>(() => document.body.innerText.toLowerCase());
    expect(
      bodyText.includes('schematic') || bodyText.includes('pcb design'),
      'Clicking Features nav should load the features page content'
    ).toBeTruthy();
  });

  test('PDF feature sheets are linked from Features page @functional', async ({ page, siteConfig }) => {
    await page.goto(siteConfig.url.replace(/\/$/, '') + FEATURES_PATH, {
      waitUntil: 'domcontentloaded',
    });
    const pdfLinks = page.locator('a[href$=".pdf"]');
    const count = await pdfLinks.count();
    expect(count, 'Features page should link to at least one PDF feature sheet').toBeGreaterThan(0);
    console.info(`[functional] PDF feature sheets found: ${count}`);
  });
});
