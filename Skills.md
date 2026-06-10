# Skills — CADint PCB QA Agentic Solution

Skills are invokable workflows defined in `.claude/commands/`. Type `/skill-name` in Claude Code to run one. Each skill loads only when invoked — keeping the main context lean.

See [Claude Code skills docs](https://code.claude.com/docs/en/skills) for full reference.

---

## Available Skills

### `/analyze-site`

**File:** `.claude/commands/analyze-site.md`

**Purpose:** Navigate to `www.cadint.com`, inspect its DOM and structure, and produce an updated `site.config.json`.

**What it does:**
1. Fetches the homepage and follows redirects to the canonical URL
2. Extracts page title, meta description, and primary nav links
3. Checks for contact forms, HTTPS, and responsive viewport meta tag
4. Tries `/contact`, `/contact-us`, and `/download` for additional structure
5. Outputs a complete `site.config.json` block and an issues checklist

**When to use:** After a site redesign, when selectors are breaking, or when onboarding.

---

### `/generate-full-suite`

**File:** `.claude/commands/generate-full-suite.md`

**Purpose:** Analyze the live site and generate a complete Page Object Model + Playwright test suite from scratch.

**What it does:**
1. Reads `site.config.json` for the target URL and flags
2. Fetches each discovered page and maps its interactive elements
3. Creates or updates page object classes in `src/pages/`
4. Generates spec files in the appropriate `tests/` subdirectory for each page
5. Runs `npx tsc --noEmit` to verify the generated code compiles

**When to use:** Initial test suite creation, or after a major site overhaul that invalidates existing selectors.

---

### `/run-smoke`

**File:** `.claude/commands/run-smoke.md`

**Purpose:** Run the `@smoke` test suite and report results in the console.

**What it does:**
1. Executes `npm run test:smoke`
2. Parses the JSON results from `test-results/results.json`
3. Reports pass count, fail count, and any failure messages
4. Suggests fixes for common failure patterns (HTTPS, title missing, JS errors)

**When to use:** Quick health check before a demo, after a deployment, or as the first step in a debugging session.

---

### `/update-baseline`

**File:** `.claude/commands/update-baseline.md`

**Purpose:** Regenerate all visual regression baseline screenshots.

**What it does:**
1. Runs `npm run baseline` (Playwright `--update-snapshots` flag)
2. Lists which snapshots were updated
3. Reminds you to commit the new baselines

**When to use:** After intentional UI changes that alter page appearance — not as a way to silence failing visual tests caused by regressions.

---

### `/generate-report`

**File:** `.claude/commands/generate-report.md`

**Purpose:** Parse the latest Playwright test results and produce a human-readable markdown report.

**What it does:**
1. Reads `test-results/results.json`
2. Groups results by suite tag (`@smoke`, `@functional`, `@regression`, etc.)
3. Lists failures with file, test name, and error message
4. Calculates pass rate by suite
5. Outputs a markdown report block suitable for a Slack message or GitHub comment

**When to use:** After a full test run in CI or locally, when you need a shareable summary.

---

## Writing new skills

Add a `.md` file to `.claude/commands/`. The filename becomes the slash command name (e.g., `check-accessibility.md` → `/check-accessibility`).

### Minimal skill template

```markdown
# /my-skill-name

One-line description of what this skill does.

## Usage
/my-skill-name [optional-args]

## What this command does
1. Step one
2. Step two
3. Step three

## Output format
Describe what Claude should produce.
```

Skills load only when invoked, so they can be as long and detailed as needed without consuming context tokens in every session. Use them for multi-step procedures, reference checklists, or workflows that would bloat CLAUDE.md.

See [Claude Code skills docs](https://code.claude.com/docs/en/skills) for frontmatter options including `invocation` control and subagent execution.
