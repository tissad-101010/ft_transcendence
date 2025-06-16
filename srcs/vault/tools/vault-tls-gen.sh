#!/bin/bash

CERTS_DIR="vault/certs"
mkdir -p "$CERTS_DIR"

openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout "$CERTS_DIR/vault.key" \
  -out "$CERTS_DIR/vault.crt" \
  -days 365 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:0.0.0.0,DNS:localhost,DNS:hashicorp_vault"

chmod 644 "$CERTS_DIR/vault.crt"
chmod 644 "$CERTS_DIR/vault.key"

echo "✅ Vault TLS certificates generated in $CERTS_DIR"
