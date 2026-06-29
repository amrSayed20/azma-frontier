import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },
  {
    files: ["src/core/constitution-runtime/**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/core/constitution-runtime/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
  // TODO[Technical Debt]: These modules predate strict ESLint enforcement.
  // Each path must be cleaned up when its corresponding WP is refactored.
  // Do NOT expand this list. Remove entries as modules are fixed.
  {
    files: [
      "src/chambers/makman-al-ghayah/rendering-bridge.ts",
      "src/chambers/ras-al-amr/ras-al-amr-state-manager.ts",
      "src/core/al-wateen-assistant/**/*.ts",
      "src/core/chamber-integration/**/*.ts",
      "src/core/future-simulation/future-simulation-types.ts",
      "src/core/sovereign-assistant/**/*.ts",
      "src/gateway/bab-al-wusul/**/*.ts",
      "src/orchestrator/al-watin/**/*.ts",
      "src/system-root/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
