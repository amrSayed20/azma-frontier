// A SCAN, NOT A RULESET THE BUILD DEPENDS ON.
//
// `eslint-plugin-security` is a heuristic hunter: it flags shapes that are
// OFTEN dangerous — a RegExp built from a variable, a filesystem path that is
// not a literal, a dynamic object index. Most of its findings in any real
// codebase are false positives, and wiring it into the committed config would
// make the build fail on suspicion rather than on fact.
//
// So it lives here, runs on demand, and every finding it raises is READ
// before it is believed:
//
//     npx eslint --no-config-lookup -c eslint.security.mjs "src/**/*.ts" "app/**/*.ts"
import security from 'eslint-plugin-security';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'app/**/*.ts', 'app/**/*.tsx'],
    ignores: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
    // WITHOUT THIS the scan reports 1,279 "findings" that are all the same
    // thing: ESLint cannot parse TypeScript with its default parser, so every
    // file fails at its first type annotation. A scanner that cannot read the
    // language reports nothing true.
    languageOptions: { parser: tsParser, ecmaVersion: 'latest', sourceType: 'module' },
    plugins: { security },
    rules: {
      // The ones that can actually name an exploit in this codebase.
      'security/detect-child-process': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-non-literal-require': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-pseudoRandomBytes': 'error',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-object-injection': 'off', // noise: flags every obj[key]
    },
  },
];
