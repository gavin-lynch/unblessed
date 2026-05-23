import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: [
      "@gavin-lynch/unblessed-browser",
      "@gavin-lynch/unblessed-core",
      "xterm",
    ],
  },
});
