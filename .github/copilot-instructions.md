# GitHub Copilot Instructions — CADint PCB QA

This repository is a **Playwright + TypeScript regression test suite** for http://www.cadint.com. It uses a Page Object Model (POM) architecture.

## Architecture

- Page objects live in `src/pages/` and extend `BasePage` from `./base.page`
- Tests import `{ test, expect }` from `@fixtures/site.fixture` — never from `@playwright/test`
- Locators are `readonly Locator` properties on page object classes
- Methods on page objects are actions only — no `expect()` inside them
- Tests are tagged: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`, `@regression`

## Rules

- Never submit forms — fill fields only, never click Submit
- Never hardcode the URL — use `baseURL` (Playwright config) or `siteConfig.url` (fixture)
- Never use `page.waitForTimeout()` — use Playwright auto-waiting
- Never use `any` type without justification
- TypeScript strict mode is on — all properties must be typed

## Test file pattern

```typescript
import { test, expect } from '@fixtures/site.fixture';

test.describe('Feature Name @tag', () => {
  test('does something expected @tag', async ({ homePage, siteConfig }) => {
    // use page object methods
    const text = await homePage.getMainHeading();
    expect(text).toBeTruthy();
  });
});
```

## Page object pattern

```typescript
import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class MyPage extends BasePage {
  readonly myElement: Locator = this.page.locator('selector');

  async getMyElementText(): Promise<string> {
    return (await this.myElement.textContent())?.trim() ?? '';
  }
}
```

## Path aliases (tsconfig.json)

- `@pages/` → `src/pages/`
- `@fixtures/` → `src/fixtures/`
- `@utils/` → `src/utils/`
- `@sitetypes/` → `src/types/`  (NOT @types — that's reserved by TypeScript)

## File locations

- `src/pages/` — page object classes
- `src/fixtures/site.fixture.ts` — custom fixtures
- `tests/smoke/` — @smoke tests
- `tests/navigation/` — @navigation tests
- `tests/forms/` — @forms tests
- `tests/functional/` — @functional tests
- `tests/visual/` — @visual tests
- `tests/regression/` — @regression tests
- `tests/responsive/` — @responsive tests
