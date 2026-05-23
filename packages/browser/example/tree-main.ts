/**
 * Vite entry for the Tree widget example. Same DOM guard as `main.ts`.
 */

if (typeof document === "undefined") {
  const lines = [
    "This example runs in a browser: xterm.js needs `document` and `window`.",
    "",
    "From the repository root:",
    "  pnpm --filter @gavin-lynch/unblessed-browser dev",
    "Then open http://localhost:8080/tree.html",
    "",
    "Do not run: bun tree-main.ts  or  node tree-main.ts",
  ];
  const message = lines.join("\n");
  console.error(message);
  if (typeof process !== "undefined" && typeof process.exit === "function") {
    process.exit(1);
  }
  throw new Error(message);
}

void import("./tree-app.ts").catch((err) => {
  console.error(err);
});
