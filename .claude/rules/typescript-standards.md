---
paths:
  - "src/**/*.ts"
  - "tests/**/*.ts"
---

# TypeScript Standards

Rules for all TypeScript source files in this project.

## Strict mode

`tsconfig.json` enables `strict: true`. This means:
- All function parameters must be typed
- No implicit `any`
- Strict null checks — handle `null` and `undefined` explicitly
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe access

## Type annotations

```typescript
// correct — explicit return type
async getTitle(): Promise<string> {
  return (await this.page.title()).trim();
}

// wrong — implicit any / missing return type
async getTitle() {
  return this.page.title();
}
```

## Null handling

```typescript
// correct
const text = (await element.textContent())?.trim() ?? '';

// wrong — assumes textContent() never returns null
const text = (await element.textContent()).trim();
```

## Async/await

Always use `async/await` — never raw `.then()` chains in test or page object code.

## Imports

Use path aliases defined in `tsconfig.json`:
- `@pages/` → `src/pages/`
- `@fixtures/` → `src/fixtures/`
- `@utils/` → `src/utils/`
- `@sitetypes/` → `src/types/`  (note: `@types` is reserved by TypeScript — use `@sitetypes`)

Never use relative paths like `../../src/pages/` in test files.

## Forbidden patterns

- `as any` — use proper types or `unknown` with a type guard
- `!` non-null assertion on Playwright responses — check `response !== null` first
- `console.log` in committed test code — use `console.warn` for soft warnings
- Unused imports — ESLint will flag these; fix before committing

## Interfaces

Define shared types in `src/types/`. Import them from `@types/` in page objects and tests.
