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
#                          POSTRESQL ENTRYPOINT SCRIPT                         #
#******************************************************************************#

# Define the data directory
DATA_DIR="/var/lib/postgresql/data"
# Define the configuration directory
CONF_DIR="/etc/postgresql"

# Create the data directory if it does not exist
if [ ! -d "$DATA_DIR" ]; then
  echo "📂 Creating PostgreSQL data directory..."
  mkdir -p "$DATA_DIR"
fi
chown -R postgres:postgres "$DATA_DIR"
chmod 700 "$DATA_DIR"


# Create the configuration directory if it does not exist
if [ ! -d "$CONF_DIR" ]; then
  echo "📂 Creating PostgreSQL configuration directory... "
  mkdir -p "$CONF_DIR"
fi
# Assure the permissions are correct
chown -R postgres:postgres "$CONF_DIR"
chmod 755 "$CONF_DIR"


#******************************************************************************#
#                       INITIALIZE POSTGRESQL DATABASE                         #
#******************************************************************************#
# Initialize the PostgreSql if it does not exist
if [ ! -s "$DATA_DIR/PG_VERSION" ]; then
  echo "🛠️  Initializing PostgreSQL database..."
  su-exec postgres initdb -D "$DATA_DIR"


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
else 
  echo "📦 PostgreSQL data directory already initialized."
fi
#******************************************************************************#


#******************************************************************************#  
#                  INITIALIZATION SQL SCRIPT FOR POSTGRESQL                    #
#******************************************************************************#
  # This script will be executed on the first run of the container to set up the database

  # Create the init.sql script if it does not exist
    echo "📝 Creating init.sql script..."
#******************************************************************************#
    cat <<EOF > /tmp/init.sql
-- PostgreSQL initialization script
-- This script will create the database and user if they do not exist
SELECT 'CREATE DATABASE "UserService"'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'UserService'
)\gexec
-- Create the user if it does not exist
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$POSTGRES_USER') THEN
      CREATE USER "$POSTGRES_USER" WITH PASSWORD '$POSTGRES_PASSWORD';
   END IF;
END
\$\$;

-- Grant privileges to the user on the database
GRANT ALL PRIVILEGES ON DATABASE "$POSTGRES_DB" TO "$POSTGRES_USER";

-- Set the password for the postgres user
ALTER USER postgres WITH PASSWORD '$POSTGRES_ROOT_PASSWORD';
EOF
#******************************************************************************#
    echo "✅  init.sql created successfully."
#******************************************************************************#
#                       WARPPER FOR THE INIT.SQL SCRIPT                        #
#******************************************************************************#
  #wrapper for the init.sql script
# 
echo "▶️   Starting PostgreSQL temporarily."
su-exec postgres postgres -D "$DATA_DIR" &
PG_PID=$!

# 
until su-exec postgres pg_isready -q; do
  echo "⏳  Waiting for PostgreSQL to be ready..."
  sleep 1
done

# 
if [ -f /tmp/init.sql ]; then
    echo "📄  Running /tmp/init.sql"
    su-exec postgres psql -U postgres -f /tmp/init.sql
    rm /tmp/init.sql
fi

# 
echo "🛑  Stopping temporary PostgreSQL"
kill "$PG_PID"
wait "$PG_PID"
#******************************************************************************#
#******************************************************************************#





# Create the init.sql script that will be executed on the first run
echo "🚀 Starting PostgreSQL server..."
exec su-exec postgres postgres -D "$DATA_DIR" 
# exec tail -f /dev/null

#*****************************************************************************#