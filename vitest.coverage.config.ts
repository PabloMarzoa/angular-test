import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration used exclusively when running coverage
 * (ng test --configuration=coverage → vitest.coverage.config.ts).
 *
 * The Angular build builder loads this via `runnerConfig` and merges it
 * with its own Angular-specific plugin setup, so we only need to declare
 * the extra coverage options here.
 */
export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    environment: 'jsdom',
    environmentOptions: {
      url: 'http://localhost/',
    },
  },
});
