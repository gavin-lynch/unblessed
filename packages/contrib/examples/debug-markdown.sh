#!/bin/bash
# Debug markdown colors - runs test and copies output to clipboard

cd "$(dirname "$0")/.." || exit 1

# Force colors to be enabled for chalk
export FORCE_COLOR=1

# Run the debug test with timeout to prevent hanging
# Capture all output
timeout 2 bun run examples/debug-markdown-colors.ts 2>&1 | tee /tmp/markdown-debug-output.txt || true

# Also get the file output if it exists
if [ -f /tmp/markdown-output.txt ]; then
  echo "" >> /tmp/markdown-debug-output.txt
  echo "=== FILE OUTPUT ===" >> /tmp/markdown-debug-output.txt
  cat /tmp/markdown-output.txt >> /tmp/markdown-debug-output.txt
fi

# Copy to clipboard
cat /tmp/markdown-debug-output.txt | pbcopy

echo ""
echo "✓ Output copied to clipboard! Paste it here for review."
echo "  Full output also saved to: /tmp/markdown-debug-output.txt"
