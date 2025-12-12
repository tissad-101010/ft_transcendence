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

set -e


# echo "🔄 Generating Prisma client..."
# npx prisma generate

until pg_isready -h postgreSQL -p $DB_PORT -U admin; do
  # echo "connecting to PostgreSQL at $DB_HOST:$DB_PORT as $DB_USER..."
  echo "🔄 Waiting for PostgreSQL to be ready..."
  sleep 2
done

VAULT_ADDR=http://hashicorp_vault:8200

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

# echo "pg_isready -h postgreSQL -p $DB_PORT -U admin: PostgreSQL is ready!"
echo "🚀 Starting service-users app..."
npm run prisma:generate
npm run prisma:reset
npm run prisma:migrate
npm run dev 
# exec tail -f /dev/null 