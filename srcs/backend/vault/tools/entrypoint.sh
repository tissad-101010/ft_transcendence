#!/bin/bash
set -e

# Lancer Vault en mode server avec la config
echo "🔧 Starting Vault server with configuration..."
exec vault server -config=/vault/config/vault.hcl







# #!/bin/bash
# set -e

# VAULT_ADDR=${VAULT_ADDR:-http://0.0.0.0:8200}
# INIT_FILE="/vault/init.json"
# UNSEAL_KEY_FILE="/vault/unseal.key"

# # Démarre Vault en mode serveur avec ton config
# vault server -config=/vault/config/vault.hcl &
# VAULT_PID=$!

# #!/bin/bash
# set -e

# VAULT_ADDR=${VAULT_ADDR:-https://0.0.0.0:8200}
# UNSEAL_KEY=${UNSEAL_KEY}


# if [ -z "$UNSEAL_KEY" ]; then
#   echo "❌ UNSEAL_KEY not set in .env"
#   exit 1
# fi




# # check Vault sealed status
# SEALED=$(vault status -tls-skip-verify -format=json | jq -r .sealed)
# echo "Vault sealed status: $SEALED"

# until [ "$SEALED" = "false" ]; do
#   echo "🔓 Vault is sealed, unsealing..."
#   vault operator unseal -tls-skip-verify $UNSEAL_KEY
#   SEALED=$(vault status -tls-skip-verify -format=json | jq -r .sealed)
#   if [ "$SEALED" = "false" ]; then
#     echo "✅ Vault is now unsealed!"
#     break
#   fi
#   echo "🔒 Vault still sealed, retrying..."
#   sleep 2
# done


# # wait for Vault process to finish
# wait $VAULT_PID

