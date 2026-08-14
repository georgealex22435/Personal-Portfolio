import { defineConfig, devices } from '@playwright/test'

/**
 * E2E config.
 *
 * Two servers on purpose:
 *  - wrangler dev (8787) for everything that needs the real Workers runtime — the
 *    Accept-Language redirect, /api/*, KV-backed rate limiting.
 *  - a plain static server (4180) for the cache-busting spec, because wrangler
 *    snapshots its asset manifest at startup and cannot see a mid-test rebuild.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],

  use: {
    baseURL: 'http://127.0.0.1:8787',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /cache-bust\.spec\.ts/,
    },
    {
      name: 'cache-bust',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4180' },
      testMatch: /cache-bust\.spec\.ts/,
    },
  ],

  webServer: [
    {
      command: 'npx wrangler dev --port 8787 --local',
      url: 'http://127.0.0.1:8787/api/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'node scripts/static-server.mjs',
      url: 'http://127.0.0.1:4180/version.json',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
})
