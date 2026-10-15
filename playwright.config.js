import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const BASE_URL = "http://localhost:5173/rock-paper-scissors/";

// https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "html",

  use: {
    baseURL: BASE_URL,
    locale: "en-US",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev -- --port 5173 --strictPort",
    url: BASE_URL,
    reuseExistingServer: !isCI,
  },
});
