import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "dist/**",
    "build/**",
  ]),
]);

export default eslintConfig;
