# CADint PCB — QA Agentic Solution

Playwright + TypeScript regression test suite for [http://www.cadint.com](http://www.cadint.com), built with a Page Object Model (POM) architecture and powered by Claude Code for agentic test generation and maintenance.

---

## Table of Contents

- [Purpose](#purpose)
- [Tech Stack](#tech-stack)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Agents](#agents)
- [Skills (Slash Commands)](#skills-slash-commands)
- [Rules](#rules)
- [Instructions (CLAUDE.md)](#instructions-claudemd)
- [.github Folder](#github-folder)
- [Contributing](#contributing)

---

## Purpose

This repository automates regression, functional, and smoke testing for the CADint PCB marketing website at **http://www.cadint.com**. CADint PCB is a professional PCB design software suite offering schematic capture, multi-layer PCB layout, 3D visualization, and import/export tooling for engineering professionals.

Tests verify that the website is available, loads correctly, renders all content sections, navigation works, forms are accessible (without submitting them), and visual snapshots remain stable across releases.

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Playwright](https://playwright.dev/) | ^1.44 | Browser automation across Chromium, mobile, tablet |
| TypeScript | ^5.4 | Strict-mode typed test code |
| [Claude Code](https://code.claude.com) | latest | AI-assisted test generation and maintenance |
| GitHub Actions | — | CI/CD pipeline |
| ESLint | ^8.57 | Linting |

---

## Development Environment Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (bundled with Node)
- **Git**
- **Claude Code** CLI (for agentic workflows): `irm https://claude.ai/install.ps1 | iex` (Windows PowerShell)

### Clone and install

```bash
git clone https://github.com/<org>/cadint_pcb_QA_Agentic_Solution.git
cd cadint_pcb_QA_Agentic_Solution

# Install npm dependencies
npm install

# Install Playwright browser binaries
npx playwright install
```

### Environment variables

Copy `.env.example` to `.env` and adjust if needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `SITE_URL` | (from site.config.json) | Override the target URL at runtime |
| `CI` | — | Set to `1` in CI to enable retry logic and stricter settings |

### Verify installation

```bash
npm run typecheck    # TypeScript must compile cleanly
npm run lint         # No ESLint errors
npm run test:smoke   # At least one browser must reach the site
```

---

## Project Structure

```
cadint_pcb_QA_Agentic_Solution/
├── site.config.json              # Site URL and feature flags
├── playwright.config.ts          # Playwright projects (desktop, mobile, tablet)
├── global-setup.ts               # Pre-run reachability check
├── CLAUDE.md                     # Claude Code persistent instructions
├── AGENTS.md                     # Agent reference (this project's agents)
├── Skills.md                     # Skill (slash command) reference
│
├── src/
│   ├── pages/                    # Page Object Model classes
│   │   ├── base.page.ts          # BasePage — shared navigation + utilities
│   │   ├── home.page.ts          # HomePage — hero, CTAs, main heading
│   │   ├── navigation.page.ts    # NavigationPage — nav, mobile menu, link checks
│   │   ├── contact.page.ts       # ContactFormPage — form field inspection
│   │   ├── products.page.ts      # ProductsPage — features, download CTAs
│   │   └── downloads.page.ts     # DownloadsPage — download section
│   ├── fixtures/
│   │   └── site.fixture.ts       # Custom Playwright fixtures exposing page objects
│   ├── utils/
│   │   ├── link-checker.ts       # Bulk link reachability helper
│   │   └── visual-helper.ts      # Screenshot comparison utilities
│   └── types/
│       └── site-config.types.ts  # SiteConfig TypeScript interface
│
├── tests/
│   ├── smoke/
│   │   └── site-availability.spec.ts    # @smoke — site up, title, no JS errors
│   ├── navigation/
│   │   └── nav-links.spec.ts            # @navigation — nav structure and routing
│   ├── forms/
│   │   └── contact-form.spec.ts         # @forms — form fields, validation
│   ├── functional/
│   │   ├── pcb-features.spec.ts         # @functional — product feature sections
│   │   └── downloads.spec.ts            # @functional — download CTAs and links
│   ├── visual/
│   │   └── visual-regression.spec.ts    # @visual — screenshot regression
│   ├── regression/
│   │   └── cross-page-consistency.spec.ts  # @regression — nav/footer/branding across pages
│   └── responsive/
│       └── layout.spec.ts               # @responsive — mobile/tablet/desktop layout
│
├── .claude/
│   ├── agents/                   # Claude Code subagent definitions
│   │   ├── site-analyzer.md      # Crawls site and populates site.config.json
│   │   ├── test-generator.md     # Generates site-specific spec files
│   │   └── regression-runner.md  # Runs and analyzes regression test results
│   ├── commands/                 # Skill definitions (slash commands)
│   │   ├── analyze-site.md       # /analyze-site
│   │   ├── generate-full-suite.md # /generate-full-suite
│   │   ├── run-smoke.md          # /run-smoke
│   │   ├── update-baseline.md    # /update-baseline
│   │   └── generate-report.md    # /generate-report
│   ├── rules/                    # Path-scoped Claude Code rules
│   │   ├── playwright-conventions.md   # Loaded for tests/**
│   │   ├── pom-architecture.md         # Loaded for src/pages/**
│   │   └── typescript-standards.md     # Loaded for src/**
│   └── hooks/
│       └── pre-test.sh           # Pre-run type-check hook
│
└── .github/
    ├── CONTRIBUTING.md           # How to contribute to this repo
    ├── PULL_REQUEST_TEMPLATE.md  # PR checklist
    ├── copilot-instructions.md   # GitHub Copilot context (mirrors CLAUDE.md)
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md         # Bug report template
    │   └── test_request.md       # New test request template
    └── workflows/
        └── playwright-ci.yml     # GitHub Actions CI workflow
```

---

## Running Tests

```bash
# All tests
npm test

# By tag / suite
npm run test:smoke          # Fast availability checks (@smoke)
npm run test:navigation     # Nav links and routing (@navigation)
npm run test:forms          # Form fields and validation (@forms)
npm run test:functional     # Business feature tests (@functional)
npm run test:visual         # Screenshot regression (@visual)
npm run test:regression     # Cross-page consistency (@regression)
npm run test:responsive     # Viewport layout checks (@responsive)

# UI mode (interactive)
npm run test:headed

# Update visual baselines
npm run baseline

# Show HTML report
npm run report
```

### Running against a different URL

```bash
SITE_URL=https://staging.cadint.com npm test
```

---

## Agents

This project uses Claude Code [subagents](https://code.claude.com/docs/en/sub-agents) for specialized tasks. Full definitions are in `.claude/agents/`. See [AGENTS.md](./AGENTS.md) for a complete reference.

| Agent | File | When Claude uses it |
|-------|------|---------------------|
| `site-analyzer` | `.claude/agents/site-analyzer.md` | Crawling the live site to populate `site.config.json` |
| `test-generator` | `.claude/agents/test-generator.md` | Generating new spec files from site discovery |
| `regression-runner` | `.claude/agents/regression-runner.md` | Executing tests and summarizing failures |

---

## Skills (Slash Commands)

Skills are invokable workflows defined in `.claude/commands/`. See [Skills.md](./Skills.md) for full documentation.

| Command | Description |
|---------|-------------|
| `/analyze-site` | Crawl `www.cadint.com` and refresh `site.config.json` |
| `/generate-full-suite` | Generate a complete POM + test suite from the live site |
| `/run-smoke` | Run `@smoke` tests and report pass/fail |
| `/update-baseline` | Refresh all visual regression snapshots |
| `/generate-report` | Produce a human-readable test results summary |

---

## Rules

Path-scoped rules live in `.claude/rules/` and are automatically loaded by Claude Code when working with matching files.

| Rule file | Applied to | Contents |
|-----------|-----------|---------|
| `playwright-conventions.md` | `tests/**` | Tagging, fixture imports, assertion patterns |
| `pom-architecture.md` | `src/pages/**` | Class structure, locator placement, no-assertions rule |
| `typescript-standards.md` | `src/**` | Strict mode, type annotations, forbidden patterns |

---

## Instructions (CLAUDE.md)

`CLAUDE.md` at the project root is the primary instruction file for Claude Code. It is loaded at the start of every Claude Code session and contains:

- Project purpose and architecture overview
- Key file locations
- Architecture rules (POM, test patterns, TypeScript)
- Available npm scripts
- Test tagging reference
- Do-not rules (no form submission, no hardcoded URLs, etc.)

Edit `CLAUDE.md` when Claude repeats a mistake, or when a new team member would need that context to be productive.

---

## .github Folder

The `.github/` directory contains GitHub platform configuration:

| Path | Purpose |
|------|---------|
| `CONTRIBUTING.md` | Step-by-step guide for new contributors |
| `PULL_REQUEST_TEMPLATE.md` | Checklist every PR author must complete |
| `ISSUE_TEMPLATE/bug_report.md` | Structured template for reporting test failures or site bugs |
| `ISSUE_TEMPLATE/test_request.md` | Template for requesting new test coverage |
| `copilot-instructions.md` | GitHub Copilot context — mirrors CLAUDE.md for Copilot users |
| `workflows/playwright-ci.yml` | CI pipeline: runs all tests on push/PR to `main` |

---

## Contributing

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for the full guide. Quick summary:

1. Branch from `main`: `git checkout -b feat/your-feature`
2. Run `npm run typecheck` and `npm run lint` — both must pass
3. Add or update the relevant page object in `src/pages/` before writing tests
4. Tag every test with at least one standard tag (`@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`, or `@regression`)
5. Never submit forms, hardcode URLs, or add `expect()` inside page objects
6. Open a PR using the template — CI must be green before merge

---

*This repository is part of the Phoenix Startup QA Agentic Solutions project.*
