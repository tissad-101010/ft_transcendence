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

until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER"; do
    echo "connecting to PostgreSQL at $POSTGRES_HOST:$POSTGRES_PORT as $POSTGRES_USER..."
    echo "🔄 Waiting for PostgreSQL to be ready..."
  sleep 2
done
echo "pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER"
echo "🚀 Starting Fastify app..."
npm run dev
# exec tail -f /dev/null &