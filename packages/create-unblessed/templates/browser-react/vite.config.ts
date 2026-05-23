import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: [
      "@gavin-lynch/unblessed-browser",
      "@gavin-lynch/unblessed-core",
      "@gavin-lynch/unblessed-react",
      "react",
      "xterm",
    ],
  },
});
