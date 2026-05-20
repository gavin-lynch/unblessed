/**
 * Vite entry for the Lip Gloss / charm example. Same DOM guard as `main.ts`.
 */

if (typeof document === "undefined") {
  const lines = [
    "This example runs in a browser: xterm.js needs `document` and `window`.",
    "",
    "From the repository root:",
    "  pnpm --filter @unblessed/browser dev",
    "Then open http://localhost:8080/charm.html",
    "",
    "Do not run: bun charm-main.ts  or  node charm-main.ts",
  ];
  const message = lines.join("\n");
  console.error(message);
  if (typeof process !== "undefined" && typeof process.exit === "function") {
    process.exit(1);
  }
  throw new Error(message);
}

void import("./charm-app.ts").catch((err) => {
  console.error(err);
});
