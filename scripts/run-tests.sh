#!/bin/bash
# Run tests for IBKR MCP Server

echo "Running IBKR MCP Server Tests..."
echo

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
fi

# Build the project
echo "Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Build failed"
    exit 1
fi

echo
echo "Running unit tests..."
npm test

if [ $? -ne 0 ]; then
    echo
    echo "Some tests failed. Check the output above."
else
    echo
    echo "All tests passed! ✅"
fi

echo
echo "To run integration tests with a live IBKR connection:"
echo "  1. Start IBKR Gateway: ./scripts/start-gateway.sh"
echo "  2. Run: node examples/test-client.js"
echo