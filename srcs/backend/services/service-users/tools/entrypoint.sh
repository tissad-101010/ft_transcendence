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


## service-users entrypoint script
set -e



VAULT_ADDR=https://hashicorp_vault:8200
VAULT_PATH="secret/backend"

echo "⏳ Waiting for Vault to be unsealed..."

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


echo "🚀 Loading secrets from Vault path: $VAULT_PATH"

# Récupérer secrets KV v2 et exporter en variables d'environnement
vault agent -config=/app/vault_agent/vault_agent.hcl &
VAULT_PID=$!
# kill "$VAULT_PID" if signal SIGTERM or SIGINT is received
# trap kill $AGENT_PID SIGTERM SIGINT
echo "🚀 Loading secrets from Vault path: $VAULT_PATH"
# attendre que Vault Agent écrive les secrets
while [ ! -f /secrets/user/secrets.env ]; do
  echo "⏳ Waiting for Vault Agent..."
  sleep 1
done

set -a
. /secrets/user/secrets.env 
set +a
export DATABASE_URL="postgresql://${DB_USER}:${USER_SERVICE_DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "✅ Secrets loaded and environment variables set."




# echo "pg_isready -h postgreSQL -p $DB_PORT -U admin: PostgreSQL is ready!"
echo "🔄 Generating Prisma client..."
# npx prisma generate
until pg_isready -h postgreSQL -p $DB_PORT -U admin; do
  # echo "connecting to PostgreSQL at $DB_HOST:$DB_PORT as $DB_USER..."
  echo "🔄 Waiting for PostgreSQL to be ready..."
  sleep 2
done
echo "🚀 Starting service-users app..."
npm run prisma:generate
# npm run prisma:reset
npm run prisma:migrate
npm run start
# exec tail -f /dev/null 