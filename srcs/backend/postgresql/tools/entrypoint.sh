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

# Define the data directory
DATA_DIR="/var/lib/postgresql/data"
# Define the configuration directory
CONF_DIR="/etc/postgresql"

# Create the data directory if it does not exist
if [ ! -d "$DATA_DIR" ]; then
  echo "📂 Creating PostgreSQL data directory..."
  mkdir -p "$DATA_DIR"
fi
# Create the configuration directory if it does not exist
if [ ! -d "$CONF_DIR" ]; then
  echo "📂 Creating PostgreSQL configuration directory... "
  mkdir -p "$CONF_DIR"
fi


# Assure the permissions are correct
chown -R postgres:postgres "$DATA_DIR" "$CONF_DIR"
chmod 700 "$DATA_DIR"
chmod 755 "$CONF_DIR"


# Initialize the PostgreSql if it does not exist
if [ ! -s "$DATA_DIR/PG_VERSION" ]; then
  echo "🛠️  Initializing PostgreSQL database..."
  su-exec postgres initdb -D "$DATA_DIR"
fi

# Check if the configuration files exist
if [ ! -f "$CONF_DIR/postgresql.conf" ]; then
  echo "⚠️ Missing config file: $CONF_DIR/postgresql.conf"
  exit 1
fi
if [ ! -f "$CONF_DIR/pg_hba.conf" ]; then
  echo "⚠️ Missing config file: $CONF_DIR/pg_hba.conf"
  exit 1
fi
if [ ! -f "$CONF_DIR/pg_ident.conf" ]; then
  echo "⚠️ Missing config file: $CONF_DIR/pg_ident.conf"
  exit 1
fi

# Remove default configuration files if they exist
rm -f "$DATA_DIR/postgresql.conf"
rm -f "$DATA_DIR/pg_hba.conf" 
rm -f "$DATA_DIR/pg_ident.conf"

# Create symbolic links to the costom configuration files
echo "🔗 Linking configuration files..."
ln -s "$CONF_DIR/postgresql.conf" "$DATA_DIR/postgresql.conf"
ln -s "$CONF_DIR/pg_hba.conf" "$DATA_DIR/pg_hba.conf"
ln -s "$CONF_DIR/pg_ident.conf" "$DATA_DIR/pg_ident.conf"

# Create the init.sql script that will be executed on the first run




echo "🚀 Starting PostgreSQL server..."
exec su-exec postgres postgres -D "$DATA_DIR"
