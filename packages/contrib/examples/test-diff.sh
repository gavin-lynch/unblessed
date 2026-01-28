#!/bin/bash
# Simple test script for Diff widget

# Get the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Run the diff example
cd "$PROJECT_ROOT"
tsx packages/contrib/examples/diff.ts
