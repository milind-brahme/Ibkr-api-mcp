#!/bin/bash

# Script to start IBKR Client Portal Gateway
# Adjust paths according to your installation

GATEWAY_DIR="${IBKR_GATEWAY_DIR:-$HOME/clientportalapi}"
CONFIG_FILE="${GATEWAY_DIR}/root/conf.yaml"

if [ ! -d "$GATEWAY_DIR" ]; then
    echo "Error: Gateway directory not found at $GATEWAY_DIR"
    echo "Please set IBKR_GATEWAY_DIR environment variable or download the gateway"
    exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Configuration file not found at $CONFIG_FILE"
    exit 1
fi

echo "Starting IBKR Client Portal Gateway..."
echo "Gateway directory: $GATEWAY_DIR"
echo "Configuration file: $CONFIG_FILE"

cd "$GATEWAY_DIR"
./bin/run.sh root/conf.yaml