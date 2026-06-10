# Agents — CADint PCB QA Agentic Solution

This project uses [Claude Code subagents](https://code.claude.com/docs/en/sub-agents) to handle specialized, context-heavy tasks in their own context windows. Full agent definitions live in `.claude/agents/`.

---

## What are agents?

A subagent is a specialized Claude Code instance launched by the main session to handle a focused task. It runs in its own context window with a custom system prompt, specific tool access, and independent permissions. The main session delegates and receives a summary — keeping the main context clean.

Use agents for tasks that would flood the main conversation with search results, HTML dumps, or large file trees.

---

## Available Agents

### `site-analyzer`

**File:** `.claude/agents/site-analyzer.md`

**Purpose:** Crawl the live CADint PCB website and produce or update `site.config.json`.

**When Claude uses it:**
- Running `/analyze-site`
- Onboarding: first-time `site.config.json` population
- After a site redesign to verify the config is still accurate
- When selectors in tests start failing and the site structure may have changed

**Tools it uses:** WebFetch, Playwright browser context, DOM inspection

**Output:** A complete, validated `site.config.json` plus an issues checklist.

---

### `test-generator`

**File:** `.claude/agents/test-generator.md`

**Purpose:** Read `site.config.json` and generate Playwright + TypeScript test files for site-specific scenarios not covered by the shared test suite.

**When Claude uses it:**
- Running `/generate-full-suite`
- When a new page or feature is discovered on the site
- When writing regression tests for a known bug
- When asked to expand coverage for a specific page or user flow

**Tools it uses:** Read, Write, Edit, Bash (typecheck)

**Output:** TypeScript spec files in `tests/custom/` or specific test directories.

---

### `regression-runner`

**File:** `.claude/agents/regression-runner.md`

**Purpose:** Execute the regression test suite, parse results, classify failures, and produce an actionable summary.

**When Claude uses it:**
- Running `/generate-report` after a test run
- Investigating CI failures
- Pre-release regression sweeps

**Tools it uses:** Bash (npx playwright test), Read (results.json, playwright-report)

**Output:** A markdown summary of pass/fail counts, failure root causes, and recommended fixes.

---

## How to invoke agents

Claude Code automatically delegates to the appropriate agent based on context. You can also invoke them directly:

```
# Trigger site-analyzer
/analyze-site

# Trigger test-generator
/generate-full-suite

# Trigger regression-runner + report
/generate-report
```

Or ask Claude directly:

```
Analyze the cadint.com site and update site.config.json
Generate functional tests for the Downloads page
Run the regression suite and tell me what's failing
```

---

## Writing new agents

Place a markdown file in `.claude/agents/`. Use the existing agents as templates. Key sections:

```markdown
# Agent: <name>

## Role
One-paragraph description of what this agent does.

## When to invoke
Bulleted list of triggers.

## Capabilities
What tools and actions this agent can take.

## Inputs / Output
What it receives and what it produces.

## Step-by-step instructions
Numbered workflow the agent follows.
```

See [Claude Code subagents docs](https://code.claude.com/docs/en/sub-agents) for full reference.
