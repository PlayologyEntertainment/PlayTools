#!/bin/bash
# SessionStart hook: prepare the headless-browser test harness so Claude can
# load, validate, and screenshot the PlayTools HTML apps during a session.
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}"

# Install JS dependencies (playwright + @sparticuz/chromium). These come from
# the npm registry, which is in-policy, so this works without any network
# policy change. Idempotent and cache-friendly (npm install, not npm ci).
npm install --no-audit --no-fund

# Best effort: fetch the stock Playwright Chromium build. This succeeds only
# once the environment's network policy allows the Playwright CDN
# (cdn.playwright.dev). If it's blocked, the harness automatically falls back
# to @sparticuz/chromium (installed above), so a failure here is non-fatal.
npx --yes playwright install chromium >/dev/null 2>&1 \
  && echo "playtools: stock Playwright Chromium ready" \
  || echo "playtools: using in-policy @sparticuz/chromium fallback (Playwright CDN blocked)"

echo "playtools: browser harness ready — run 'npm run test:browser'"
