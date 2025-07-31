#!/bin/sh
set -e
# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    entrypoint.sh                                      :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: tissad <tissad@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/07/31 15:08:24 by tissad            #+#    #+#              #
#    Updated: 2025/07/31 15:08:27 by tissad           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

DATA_DIR="/var/lib/postgresql/data"

# Assurer les permissions si on est root
chown -R postgres:postgres "$DATA_DIR"
chmod 700 "$DATA_DIR"

# Initialisation si nécessaire
if [ ! -s "$DATA_DIR/PG_VERSION" ]; then
  echo "🛠️  Initializing PostgreSQL database..."
  su-exec postgres initdb -D "$DATA_DIR"
fi

echo "🚀 Starting PostgreSQL server..."
exec su-exec postgres postgres -D "$DATA_DIR"
