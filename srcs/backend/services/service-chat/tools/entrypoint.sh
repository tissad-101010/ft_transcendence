#!/bin/sh
# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    entrypoint.sh                                      :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: tissad <tissad@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/08/05 14:17:44 by tissad            #+#    #+#              #
#    Updated: 2025/08/05 14:17:45 by tissad           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #


## service-chat entrypoint script
set -e

while true; do
  STATUS=$(curl -k https://hashicorp_vault:8200/v1/sys/health | sed -n 's/.*"sealed":\([a-z]*\).*/\1/p')
  echo "Vault sealed status: $STATUS"
  if [ "$STATUS" = "false" ]; then
    echo "✅ Vault is unsealed!"
    break
  fi

  echo "🔒 Vault still sealed... retrying"
  sleep 2
done


# Récupérer secrets KV v2 et exporter en variables d'environnement
vault agent -config=/app/vault_agent/vault_agent.hcl &
VAULT_PID=$!
sleep 1
# attendre que Vault Agent écrive les secrets
while [ ! -f /secrets/chat/secrets.env ]; do
  echo "⏳ Waiting for Vault Agent..."
  sleep 1
done


set -a
. /secrets/chat/secrets.env 
set +a
export DATABASE_URL="postgresql://${DB_USER}:${CHAT_SERVICE_DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "✅ Secrets loaded and environment variables set."

echo "🔄 Generating Prisma client..."
# npx prisma generate
until pg_isready -h postgreSQL -p $DB_PORT -U admin; do

  echo "🔄 Waiting for PostgreSQL to be ready..."
  sleep 2
done
echo "✅ PostgreSQL is ready!"  
npm run prisma:migrate:prod
echo "🚀 Starting service-chat app..."
npm run start # > /dev/null 2>&1