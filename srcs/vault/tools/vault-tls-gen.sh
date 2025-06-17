#!/bin/bash

CERTS_DIR="srcs/vault/certs"
mkdir -p "$CERTS_DIR"

openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout "$CERTS_DIR/vault.key" \
  -out "$CERTS_DIR/vault.crt" \
  -days 365 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:hashicorp_vault,DNS:vault.local,DNS:127.0.1"

chmod 644 "$CERTS_DIR/vault.crt"
chmod 644 "$CERTS_DIR/vault.key"

echo "✅ Vault TLS certificates generated in $CERTS_DIR"
