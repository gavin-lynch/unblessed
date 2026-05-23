/**
 * Browser stub for the Node-only {@link marked-terminal} package.
 *
 * `@gavin-lynch/unblessed-core` bundles a static import of `marked-terminal`. In the terminal,
 * TerminalRenderer renders markdown with ansi styling. In browser/Vite demos the
 * Markdown widget is unsupported; importing the real package pulls Node-only transitive
 * modules (`supports-hyperlinks`, `supports-color`, `tty`, etc.) that expect `process`
 * and blow up during dependency pre-bundle.
 *
 * Aliasing `marked-terminal` to this stub keeps the playground and dashboards that only
 * use grid widgets working. If you truly need Markdown in the browser later, swap the
 * alias for a fuller renderer implementation.
 */

export default class MarkedTerminalRendererStub {}
