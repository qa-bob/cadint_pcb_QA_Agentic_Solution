import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface FeatureSection {
  title: string;
  visible: boolean;
}

export class ProductsPage extends BasePage {
  readonly mainHeading: Locator = this.page.locator('h1, h2').first();

  // Feature sections for CADint PCB's core capabilities
  readonly schematicSection: Locator = this.page.locator(
    '[class*="schematic" i], [id*="schematic" i], ' +
    'section:has-text("schematic"), div:has-text("Schematic Capture")'
  ).first();

  readonly pcbLayoutSection: Locator = this.page.locator(
    '[class*="layout" i], [id*="layout" i], [id*="pcb" i], ' +
    'section:has-text("PCB Layout"), div:has-text("PCB Layout")'
  ).first();

  readonly viewer3DSection: Locator = this.page.locator(
    '[class*="3d" i], [id*="3d" i], [id*="viewer" i], ' +
    'section:has-text("3D"), div:has-text("3D Viewer")'
  ).first();

  readonly downloadCTA: Locator = this.page.locator(
    'a[href*="download" i], a[href*="trial" i], ' +
    'a:has-text("Download"), a:has-text("Try Free"), a:has-text("Trial")'
  ).first();

  readonly featureSections: Locator = this.page.locator(
    'section, [class*="feature"], [class*="product-section"]'
  );

  readonly productImages: Locator = this.page.locator(
    'img[alt*="PCB" i], img[alt*="schematic" i], img[alt*="layout" i], ' +
    'img[src*="pcb" i], img[src*="screenshot" i]'
  );

  async getMainHeadingText(): Promise<string> {
    return (await this.mainHeading.textContent())?.trim() ?? '';
  }

  async getFeatureSectionCount(): Promise<number> {
    return this.featureSections.count();
  }

  async isDownloadCTAVisible(): Promise<boolean> {
    if (await this.downloadCTA.count() === 0) return false;
    return this.downloadCTA.isVisible();
  }

  async getDownloadHref(): Promise<string> {
    if (await this.downloadCTA.count() === 0) return '';
    return (await this.downloadCTA.getAttribute('href')) ?? '';
  }

  async discoverFeatureSections(): Promise<FeatureSection[]> {
    const headings = this.page.locator('h2, h3');
    const count = await headings.count();
    const sections: FeatureSection[] = [];

    for (let i = 0; i < count; i++) {
      const heading = headings.nth(i);
      const title = ((await heading.textContent()) ?? '').trim();
      if (title.length > 0) {
        sections.push({
          title,
          visible: await heading.isVisible(),
        });
      }
    }

    return sections;
  }

  async getProductImageCount(): Promise<number> {
    return this.productImages.count();
  }
}
