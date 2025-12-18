#!/bin/sh
set -e

VAULT_ADDR=${VAULT_ADDR:-https://hashicorp_vault:8200}

echo "⏳ Waiting for Vault to be initialized and unsealed..."

echo "⏳ Waiting for Vault to be unsealed..."

while true; do
  STATUS=$(curl -k https://hashicorp_vault:8200/v1/sys/health | sed -n 's/.*"sealed":\([a-z]*\).*/\1/p')
  echo "Vault sealed status: $STATUS"
  if [ "$STATUS" = "false" ]; then
    echo "✅ Vault is unsealed!"
    exit 0
  fi

  echo "🔒 Vault still sealed... retrying"
  sleep 2
done
exit 1