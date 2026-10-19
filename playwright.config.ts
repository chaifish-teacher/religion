import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";
const externalBase = process.env.MAZU_TEST_BASE_URL;
export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: externalBase ?? "http://127.0.0.1:5173",
    headless: true,
    launchOptions: {
      executablePath: existsSync("/usr/bin/chromium")
        ? "/usr/bin/chromium"
        : undefined,
    },
  },
  webServer: externalBase
    ? undefined
    : {
        command: "npm run dev -- --port 5173",
        url: "http://127.0.0.1:5173",
        reuseExistingServer: true,
      },
});
