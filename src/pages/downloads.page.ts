import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface DownloadLink {
  text: string;
  href: string;
  accessible: boolean;
}

export class DownloadsPage extends BasePage {
  readonly downloadSection: Locator = this.page.locator(
    '[id*="download" i], [class*="download" i], ' +
    'section:has-text("Download"), main'
  ).first();

  readonly downloadLinks: Locator = this.page.locator(
    'a[href*="download" i], a[href*=".exe" i], a[href*=".zip" i], ' +
    'a[href*=".msi" i], a:has-text("Download"), a:has-text("Try"), a:has-text("Trial")'
  );

  readonly versionInfo: Locator = this.page.locator(
    '[class*="version" i], [id*="version" i], ' +
    'p:has-text("version"), span:has-text("version"), td:has-text("version")'
  ).first();

  readonly systemRequirements: Locator = this.page.locator(
    '[id*="requirements" i], [class*="requirements" i], ' +
    'section:has-text("Requirements"), section:has-text("System")'
  ).first();

  readonly trialNotice: Locator = this.page.locator(
    'p:has-text("trial"), p:has-text("free"), ' +
    '[class*="trial" i], [class*="notice" i]'
  ).first();

  async getDownloadLinkCount(): Promise<number> {
    return this.downloadLinks.count();
  }

  async getAllDownloadLinks(): Promise<DownloadLink[]> {
    const count = await this.downloadLinks.count();
    const links: DownloadLink[] = [];

    for (let i = 0; i < count; i++) {
      const link = this.downloadLinks.nth(i);
      const text = ((await link.textContent()) ?? '').trim();
      const href = (await link.getAttribute('href')) ?? '';
      links.push({ text, href, accessible: await link.isVisible() });
    }

    return links;
  }

  async hasDownloadLinks(): Promise<boolean> {
    return (await this.downloadLinks.count()) > 0;
  }

  async getVersionText(): Promise<string> {
    if (await this.versionInfo.count() === 0) return '';
    return (await this.versionInfo.textContent())?.trim() ?? '';
  }

  async hasSystemRequirements(): Promise<boolean> {
    return (await this.systemRequirements.count()) > 0;
  }

  async navigateToDownloadPage(): Promise<void> {
    const downloadPageUrl = this.url.replace(/\/$/, '') + '/download';
    await this.page.goto(downloadPageUrl, { waitUntil: 'domcontentloaded' });
  }
}
