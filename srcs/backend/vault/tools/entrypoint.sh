#!/bin/bash
set -e

VAULT_ADDR=${VAULT_ADDR:-http://0.0.0.0:8200}
INIT_FILE="/vault/init.json"
UNSEAL_KEY_FILE="/vault/unseal.key"

# Démarre Vault en mode serveur avec ton config
vault server -config=/vault/config/vault.hcl &
VAULT_PID=$!

#!/bin/bash
set -e

VAULT_ADDR=${VAULT_ADDR:-https://0.0.0.0:8200}
UNSEAL_KEY=${UNSEAL_KEY}


if [ -z "$UNSEAL_KEY" ]; then
  echo "❌ UNSEAL_KEY not set in .env"
  exit 1
fi

# Attendre que Vault soit prêt
echo "🔄 Waiting for Vault to be ready... "
status=""
status=$(vault status -tls-skip-verify  -address=$VAULT_ADDR 2>/dev/null || echo "")
until [ "$status" != "" ]; do
    status=$(vault status -tls-skip-verify  -address=$VAULT_ADDR 2>/dev/null || echo "")
  sleep 2

done
echo "✅ Vault is ready!"



# Vérifier si Vault est scellé
SEALED=$(vault status -address=$VAULT_ADDR -format=json | jq -r .sealed)
echo "Vault sealed status: $SEALED"

if [ "$SEALED" = "true" ]; then
  echo "🔓 Vault is sealed, unsealing..."
  vault operator unseal -tls-skip-verify  -address=$VAULT_ADDR $UNSEAL_KEY
else
  echo "✅ Vault is already unsealed"
fi


echo "✅ Vault is initialized and unsealed"

# Attendre que Vault se termine (pid 1)
wait $VAULT_PID
