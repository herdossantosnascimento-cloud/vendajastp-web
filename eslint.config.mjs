import { defineConfig, globalIgnores } from "eslint/config";
import next from "@next/eslint-plugin-next";

export default defineConfig([
  // Plugin Next (flat config)
  {
    plugins: {
      "@next/next": next,
    },
    rules: {
      // As regras do core-web-vitals
      ...next.configs["core-web-vitals"].rules,
      // Se quiseres também TS rules do Next, podemos adicionar depois
    },
  },

  // Ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);