import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.e2e.test.js',
  fullyParallel: false,

  webServer: [
    {
      command: 'npm start',
      cwd: '.',
      url: 'http://localhost:3001/api/todos',
      reuseExistingServer: !process.env.CI,
      timeout: 30000
    },
    {
      command: 'npm start',
      cwd: '../frontend',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 60000
    }
  ],

  use: {
    baseURL: 'http://localhost:3000'
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.CI ? {} : { channel: 'chrome' })
      }
    }
  ]
});