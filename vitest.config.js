import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['tests/invite.test.js', 'happy-dom'],
    ],
    include: ['tests/**/*.test.js'],
    testTimeout: 60_000,
  },
});
