import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
    // Only the test runner bypasses Next's build-time boundary marker.
    "server-only": fileURLToPath(new URL("./tests/server-only.ts", import.meta.url)),
  } },
  test: {
    environment: "node", include: ["tests/**/*.test.ts"],
    maxWorkers: 1, testTimeout: 30000, hookTimeout: 180000,
  },
});
