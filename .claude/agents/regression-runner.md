# Agent: regression-runner

## Role

The `regression-runner` agent executes the CADint PCB regression test suite, parses results from the Playwright JSON reporter, classifies failures by category, and produces an actionable markdown summary.

## When to invoke

- Running `/generate-report` after a full test run
- Investigating CI pipeline failures
- Pre-release regression sweeps before a deployment
- When asked "what is failing in the test suite?"

## Capabilities

- Execute `npm run test:regression` and `npm run test:functional` via Bash
- Read `test-results/results.json` (Playwright JSON reporter output)
- Read `playwright-report/index.html` for additional failure context
- Read trace files in `test-results/` to diagnose flaky tests
- Cross-reference failures with page object source to suggest fixes

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `suite` | No | Which suite to run: `regression`, `functional`, `smoke`, or `all` (default: `all`) |
| `existingResults` | No | Path to existing `results.json` to skip re-running tests |

## Output

A markdown report block containing:
1. **Summary table** — pass/fail/skip counts per suite tag
2. **Failure list** — test name, file, error message, and root-cause classification
3. **Recommendations** — specific suggested fixes for each failure category
4. **Flakiness notes** — tests that passed on retry, flagged for review

## Step-by-step instructions

1. **Check for existing results:** If `test-results/results.json` exists and is less than 10 minutes old, use it. Otherwise run the test suite.
2. **Run tests:**
   ```bash
   npm run test:regression 2>&1
   npm run test:functional 2>&1
   ```
3. **Parse `test-results/results.json`:** Extract `suites[].specs[].tests[].results[]` for each test. Look at `status` (passed/failed/skipped) and `error.message`.
4. **Classify failures** into categories:
   - `SITE_DOWN` — HTTP status >= 400 or connection refused
   - `SELECTOR_STALE` — Locator not found / timeout — selector needs updating
   - `CONTENT_CHANGED` — Expected text not found — site content was updated
   - `FLAKY` — Failed on first attempt, passed on retry
   - `CONFIG_ERROR` — TypeScript compile error or missing fixture
5. **Group results** by suite tag (`@smoke`, `@functional`, `@regression`, etc.)
6. **Output the report** in the format below.

## Output format

```markdown
## Regression Report — CADint PCB

**Run date:** <date>
**Suite:** <suite-name>

### Summary

| Suite | Passed | Failed | Skipped | Pass Rate |
|-------|--------|--------|---------|-----------|
| @smoke | 5 | 0 | 0 | 100% |
| @functional | 8 | 2 | 0 | 80% |
| @regression | 12 | 1 | 0 | 92% |

### Failures

#### 1. `tests/functional/downloads.spec.ts` — "download CTA is visible"
- **Error:** Timeout 10000ms exceeded waiting for locator `a[href*="download"]`
- **Classification:** SELECTOR_STALE
- **Recommended fix:** Run `/analyze-site` to discover the current download link selector

### Flakiness notes
- None detected this run.
```

## Handling edge cases

### Site unreachable
- Classify all failures as `SITE_DOWN`
- Do not attempt selector fixes
- Recommend running `/run-smoke` first to verify connectivity

### Missing results.json
- Run tests fresh before generating the report
- If tests hang or timeout, check that `baseURL` in `site.config.json` is reachable

### All tests pass
- Output the summary table with 100% pass rates
- Note the date/time so it can be referenced as a baseline
