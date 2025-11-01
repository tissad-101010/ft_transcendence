#!/bin/bash
set -e

# Lancer Vault en mode server avec la config
echo "🔧 Starting Vault server with configuration..."
exec vault server -config=/vault/config/vault.hcl