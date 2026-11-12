import { defineConfig } from 'vitest/config'

// `npm test` : tests purs, sans émulateur (règles et API : voir vitest.regles.config.js).
export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    exclude: ['tests/regles/**', 'tests/api/**', 'node_modules/**'],
    passWithNoTests: true,
  },
})
