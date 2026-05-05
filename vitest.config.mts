import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'clover', 'lcov'],
      include: [
        'src/backend/**/*.ts',
        'src/chat/command-registry.ts',
        'src/workflow/workflow.ts',
        'src/core/types.ts',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/**/__tests__/**',
      ],
      thresholds: {
        statements: 75,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
