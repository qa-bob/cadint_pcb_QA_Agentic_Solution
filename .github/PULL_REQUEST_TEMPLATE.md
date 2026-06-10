## Description

<!-- What does this PR change? One or two sentences. -->

## Type of change

- [ ] New test(s)
- [ ] Updated page object(s)
- [ ] Bug fix in tests or framework code
- [ ] New skill or agent definition
- [ ] Tooling / config / CI change
- [ ] Documentation update

## Checklist

- [ ] `npm run typecheck` passes (exit 0)
- [ ] `npm run lint` passes (exit 0)
- [ ] `npm run test:smoke` passes locally
- [ ] All new/changed tests are tagged with at least one standard tag (`@smoke`, `@navigation`, `@forms`, `@functional`, `@visual`, `@responsive`, `@regression`)
- [ ] No form submissions in tests
- [ ] No hardcoded URLs — base URL comes from `siteConfig.url` or Playwright `baseURL`
- [ ] No `expect()` inside page object methods
- [ ] No `page.waitForTimeout()` calls
- [ ] If visual baselines changed, new snapshots are committed

## Related issues

<!-- Closes #<issue-number> -->
