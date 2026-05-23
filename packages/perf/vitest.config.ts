import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const corePath = fileURLToPath(
  new URL("../core/src/index.ts", import.meta.url),
);

export default defineConfig({
  resolve: {
    alias: {
      "@gavin-lynch/unblessed-core": corePath,
    },
  },
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
  },
});
