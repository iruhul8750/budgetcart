// @ts-check

import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.PLAYWRIGHT_BASE_URL;

if (!baseURL) {
  throw new Error('PLAYWRIGHT_BASE_URL is not defined.');
}

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  use: {
    baseURL,

    headless: !!process.env.CI,

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    trace: 'retain-on-failure',

    actionTimeout: 15000,

    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',

      use: {
        browserName: 'chromium',

        viewport: null,

        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120000,
      },

  timeout: 60000,

  expect: {
    timeout: 10000,
  },

  outputDir: 'test-results',
});