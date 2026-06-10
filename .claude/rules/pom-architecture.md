---
paths:
  - "src/pages/**/*.ts"
---

# Page Object Model Architecture Rules

Rules that apply whenever working on page object classes in `src/pages/`.

## Class structure

Every page object must:
1. Import from `@playwright/test` (for `Locator` type)
2. Import `BasePage` from `@pages/base.page`
3. Extend `BasePage`
4. Declare locators as `readonly Locator` class properties
5. Expose behavior through public async methods

```typescript
import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class ExamplePage extends BasePage {
  readonly heading: Locator = this.page.locator('h1').first();
  readonly ctaButton: Locator = this.page.getByRole('link', { name: /download/i });

  async getHeadingText(): Promise<string> {
    return (await this.heading.textContent())?.trim() ?? '';
  }

  async clickCta(): Promise<void> {
    await this.ctaButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
```

## Absolute rules

- No `expect()` inside page objects — assertions belong in spec files
- No hardcoded URLs — navigation uses `this.url` from `BasePage`
- No `page.waitForTimeout()` — use Playwright auto-waiting or `waitForLoadState`
- Locators must be typed as `readonly Locator` — never `any`
- Methods must return typed values — no implicit `any` return types

## Locator placement

Put locators as class properties, not inside methods. This makes them visible for documentation and reuse:

```typescript
// correct
readonly downloadBtn: Locator = this.page.getByRole('link', { name: /download/i });

async clickDownload(): Promise<void> {
  await this.downloadBtn.click();
}

// wrong — locator buried inside method
async clickDownload(): Promise<void> {
  await this.page.getByRole('link', { name: /download/i }).click();
}
```

## Selector strategy (priority order)

1. ARIA role: `page.getByRole('button', { name: /text/i })`
2. Label / placeholder: `page.getByLabel('Email')`, `page.getByPlaceholder('Email')`
3. Test ID: `page.getByTestId('hero')`
4. Semantic HTML: `page.locator('nav a[href]')`, `page.locator('h1')`
5. CSS attribute: `page.locator('[class*="btn"]')` — last resort only

## File naming

`<page-name>.page.ts` in `src/pages/`. One class per file. Class name is PascalCase matching the filename: `downloads.page.ts` → `DownloadsPage`.
