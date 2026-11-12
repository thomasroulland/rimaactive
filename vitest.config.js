import { defineConfig } from 'vitest/config'

// `npm test` : tests purs, sans émulateur. `npm run test:regles` : VITEST_EMULATEUR=1 inclut règles et API.
const emulateur = process.env.VITEST_EMULATEUR === '1'

export default defineConfig({
  test: {
    include: emulateur ? ['tests/regles/**/*.test.js', 'tests/api/**/*.test.js'] : ['tests/**/*.test.js'],
    exclude: emulateur ? [] : ['tests/regles/**', 'tests/api/**', 'node_modules/**'],
    passWithNoTests: true,
    fileParallelism: false,
    testTimeout: 20000,
  },
})
