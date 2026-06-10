# Contributing to CADint PCB QA Agentic Solution

Thank you for contributing. This guide covers everything a new contributor needs to add tests, update page objects, or improve tooling.

---

## Ground Rules

- **Never submit forms** — interaction tests stop at field-fill; assertions never click Submit
- **Never hardcode the site URL** — always read it from `baseURL` in Playwright config or `siteConfig.url` in fixtures
- **Never put `expect()` inside page objects** — page objects are action-only; assertions live in spec files
- **No `page.waitForTimeout()`** — use Playwright's built-in auto-waiting (`waitForSelector`, `toBeVisible`, etc.)
- **No `any` type** without an explicit comment explaining why it is necessary
- TypeScript strict mode is enabled — `npm run typecheck` must pass before every PR

---

## Branching Strategy

```
main           # protected — CI must pass, PR required
feat/<name>    # new features or test coverage
fix/<name>     # bug fixes in tests or page objects
chore/<name>   # tooling, deps, config
```

Never push directly to `main`.

---

## Step-by-Step Contribution Workflow

### 1. Set up

```bash
git clone https://github.com/<org>/cadint_pcb_QA_Agentic_Solution.git
cd cadint_pcb_QA_Agentic_Solution
npm install
npx playwright install
```

### 2. Create a branch

```bash
git checkout -b feat/my-feature
```

### 3. Write or update a page object

Every new page or section needs a POM class in `src/pages/`. Class rules:

- Extend `BasePage`
- Use `readonly Locator` properties at the class level
- Methods are actions (click, fill, navigate) — not assertions
- File name: `<page-name>.page.ts`

```typescript
import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class MyPage extends BasePage {
  readonly heading: Locator = this.page.locator('h1').first();

  async getHeadingText(): Promise<string> {
    return (await this.heading.textContent())?.trim() ?? '';
  }
}
```

### 4. Register the page object in the fixture

Add your page object to `src/fixtures/site.fixture.ts` so tests can consume it.

### 5. Write tests

- Import `{ test, expect }` from `@fixtures/site.fixture` — not from `@playwright/test`
- Tag every test with at least one: `@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`, `@regression`
- Place tests in the matching `tests/<suite>/` directory

### 6. Verify before committing

```bash
npm run typecheck   # must exit 0
npm run lint        # must exit 0
npm run test:smoke  # at least smoke must pass
```

### 7. Open a pull request

Use the PR template. Fill in all checklist items. CI must be green before a reviewer will look at it.

---

## Adding a New Agent or Skill

- **Agent:** Add a `.md` file to `.claude/agents/`. Follow the template in `AGENTS.md`.
- **Skill:** Add a `.md` file to `.claude/commands/`. Follow the template in `Skills.md`.
- Update `AGENTS.md` or `Skills.md` in the root so the index stays accurate.

---

## Updating CLAUDE.md

Edit `CLAUDE.md` when:
- Claude repeats the same mistake twice
- A code review surfaces something Claude should have caught
- A new convention is adopted by the team

Keep CLAUDE.md under 200 lines. Move detailed procedures to `.claude/commands/` as skills.

---

## Questions

Open an issue using the `test_request` template or ping the repo owner.
