/**
 * Vite entry for the dashboard example. Keeps xterm and the heavy dashboard in
 * `dashboard-app.ts` so running this file with Bun/Node prints a clear error
 * instead of `ReferenceError: document is not defined` inside xterm.
 */

if (typeof document === "undefined") {
  const lines = [
    "This example runs in a browser: xterm.js needs `document` and `window`.",
    "",
    "From the repository root:",
    "  pnpm --filter @unblessed/browser dev",
    "Then open http://localhost:8080",
    "",
    "Do not run: bun main.ts  or  node main.ts",
  ];
  const message = lines.join("\n");
  // eslint-disable-next-line no-console
  console.error(message);
  if (typeof process !== "undefined" && typeof process.exit === "function") {
    process.exit(1);
  }
  throw new Error(message);
}

void import("./dashboard-app.ts").catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});
