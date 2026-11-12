import { defineConfig } from 'vitest/config'

// Règles et API : lancé par `npm run test:regles` dans les émulateurs.
export default defineConfig({
  test: {
    include: ['tests/regles/**/*.test.js', 'tests/api/**/*.test.js'],
    passWithNoTests: true,
    fileParallelism: false,
    testTimeout: 20000,
  },
})
