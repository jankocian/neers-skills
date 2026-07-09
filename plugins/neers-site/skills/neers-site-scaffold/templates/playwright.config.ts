import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;

// `localhost`, not `127.0.0.1`. Next 16 blocks cross-origin requests to dev
// resources, so hitting the IP while the dev server announces `localhost` blocks
// `/_next/*-hmr` and the page never hydrates.
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Two modes, one config:
 *
 *   local  — `bun run dev` is already up. `reuseExistingServer` picks it up, so
 *            we never spawn a second dev server, and the feature loop costs no
 *            build.
 *   CI     — no server running, so Playwright builds and starts one.
 *
 * `bun run test` is the fast path. `bun run ci` is the build-backed one.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined, // default: 50% of cores
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL,
    trace: "on-first-retry",
    // Deterministic geometry and screenshots. `reducedMotion` is not a top-level
    // `use` option; it lives on `contextOptions`.
    contextOptions: { reducedMotion: "reduce" },
  },

  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],

  webServer: {
    // In CI there is no dev server, so build and serve the real thing — the
    // same artifact that ships. Locally this is skipped entirely.
    command: process.env.CI ? "bun run build && bun run start" : "bun run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
