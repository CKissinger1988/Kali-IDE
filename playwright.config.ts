import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*(test|spec)\.(js|ts|mjs|cjs)/,
  testIgnore: [
    '**/waveterm/**',
    '**/opencode/**',
    '**/node_modules/**',
  ],
  use: {
    headless: true,
  },
});
