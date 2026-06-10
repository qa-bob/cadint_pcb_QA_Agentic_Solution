---
paths:
  - "tests/**/*.spec.ts"
  - "tests/**/*.test.ts"
---

# Playwright Test Conventions

Rules that apply whenever working on test spec files.

## Imports

Always import from the custom fixture, never from `@playwright/test` directly:

```typescript
// correct
import { test, expect } from '@fixtures/site.fixture';

// wrong
import { test, expect } from '@playwright/test';
```

## Test structure

- Every `test.describe` block must include at least one suite tag in its name: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`, or `@regression`
- Every individual `test()` must also carry its tag inline so it can be filtered with `--grep`
- Use `test.beforeEach` for navigation that every test in the block needs
- Use fixture parameters (`{ homePage, siteConfig, page }`) — never instantiate page objects directly in a test

## Assertions

- Use Playwright's `expect` web-first assertions (`toBeVisible`, `toHaveText`, `toHaveURL`) — they auto-retry
- Never use `expect(await element.isVisible()).toBe(true)` — use `await expect(element).toBeVisible()` instead
- For soft / informational checks, use `console.warn()` and proceed — do not hard-fail on third-party content

## Waiting

- Never use `page.waitForTimeout()` for timing-based waits
- Use `page.waitForLoadState('domcontentloaded')` after navigation
- Use `page.waitForLoadState('networkidle')` only when the page is known to be SPA-rendered
- Playwright locator auto-waiting handles most element readiness — no manual waits needed

## Forms

- Fill fields with `.fill()` — never `.type()`
- Never click a submit button
- Assert field presence and attributes only

## Selectors

- Prefer role-based: `page.getByRole('button', { name: /submit/i })`
- Fall back to semantic: `page.locator('nav a[href]')`
- Avoid brittle CSS class chains like `.div.flex.mt-4 > span`
