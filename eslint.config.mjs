import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default defineConfig([
  js.configs.recommended,
  tseslint.configs.recommended,
  nextPlugin.configs["core-web-vitals"],
  globalIgnores([".next/**", "out/**", "coverage/**", "next-env.d.ts"]),
]);
