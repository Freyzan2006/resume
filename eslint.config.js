import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Layers (see README → «Архитектура»):
//   core  — domain, pure TypeScript; depends on nothing
//   build — Node: Vite plugin, loader, exporters, CLI; depends on core
//   web   — React app; depends on core (schemas as types only)
const restrict = (...patterns) => ({
  '@typescript-eslint/no-restricted-imports': ['error', { patterns }],
})

// `shadcn add` writes `import { cn } from "cn"`; web needs the one that
// knows the typography roles (see src/web/lib/utils.ts).
const cnFromUtils = {
  name: 'cn',
  message: 'импортируйте cn из "@/web/lib/utils" — он знает роли текста',
}

const otherLayer = (layer, message) => ({
  group: [`@/${layer}/*`, `**/${layer}/*`],
  message,
})

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },
  {
    files: ['src/core/**/*.ts'],
    rules: restrict(
      otherLayer('build', 'core не зависит от других слоёв'),
      otherLayer('web', 'core не зависит от других слоёв'),
      {
        group: ['node:*', 'react', 'react-dom', '@reatom/*'],
        message: 'core — чистый TypeScript: без Node, React и состояния',
      }
    ),
  },
  {
    files: ['src/build/**/*.ts', 'vite.config.ts'],
    languageOptions: { globals: globals.node },
    rules: restrict(otherLayer('web', 'build не зависит от web'), {
      group: ['@/*'],
      message: 'build запускается через node — только относительные импорты',
    }),
  },
  {
    files: ['src/web/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
    rules: {
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [cnFromUtils],
          patterns: [
            otherLayer('build', 'web не зависит от build'),
            {
              group: ['node:*', 'zod', 'yaml', 'unified', 'remark-*', 'rehype-*'],
              message: 'зависимости времени сборки не должны попадать в браузер',
            },
            {
              group: [
                '@/core/resume-schema',
                '@/core/config-schema',
                '@/core/markdown',
                '@/core/labels',
                '@/core/site',
              ],
              allowTypeImports: true,
              message: 'из этих модулей core в web — только `import type`',
            },
          ],
        },
      ],
    },
  },
])
