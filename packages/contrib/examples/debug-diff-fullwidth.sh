#!/bin/bash
# Debug script for Diff widget full-width background issue

# Trap to kill any hanging processes
trap 'pkill -9 -P $$ 2>/dev/null; exit 130' INT TERM

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
OUTPUT_FILE="/tmp/diff-debug-$(date +%s).txt"

cd "$PROJECT_ROOT"

echo "=========================================="
echo "Diff Widget Full-Width Background Debug"
echo "=========================================="
echo ""
echo "Output will be saved to: $OUTPUT_FILE"
echo ""

# Enable all debug flags
export DEBUG_DIFF_COLORS=1
export DEBUG_RENDERING=1
export FORCE_COLOR=1

# Terminal info
{
  echo "=== TERMINAL INFO ==="
  echo "TERM: $TERM"
  echo "COLORTERM: $COLORTERM"
  echo "FORCE_COLOR: $FORCE_COLOR"
  echo ""
} > "$OUTPUT_FILE"

# Use bun
RUN_CMD="bun"

# Run with timeout and capture ALL output
echo "Running diff example with debug output..."
echo "Using: $RUN_CMD"
echo ""

# Run once and capture everything - use timeout with kill signal
(timeout -s KILL 2 $RUN_CMD packages/contrib/examples/diff.ts 2>&1 || true) | tee -a "$OUTPUT_FILE"

# Add separator
echo "" >> "$OUTPUT_FILE"
echo "=== RAW OUTPUT HEX DUMP (first 5000 bytes) ===" >> "$OUTPUT_FILE"
(timeout -s KILL 2 $RUN_CMD packages/contrib/examples/diff.ts 2>&1 || true) | head -c 5000 | hexdump -C >> "$OUTPUT_FILE" 2>&1 || true

# Add separator
echo "" >> "$OUTPUT_FILE"
echo "=== ANSI CODE ANALYSIS ===" >> "$OUTPUT_FILE"
(timeout -s KILL 2 $RUN_CMD packages/contrib/examples/diff.ts 2>&1 || true) | head -c 5000 | \
  sed 's/\x1b\[/\n[ANSI]\x1b[/g' | \
  grep -E '\[ANSI\]|48;2;|48;5;|49m' | head -50 >> "$OUTPUT_FILE" 2>&1 || true

echo ""
echo "=========================================="
echo "Debug output saved to: $OUTPUT_FILE"
echo "=========================================="
echo ""
echo "File contents:"
echo ""
cat "$OUTPUT_FILE"
echo ""
echo "=========================================="
echo "Done. Exit code: ${EXIT_CODE:-0}"
echo "=========================================="
exit 0
