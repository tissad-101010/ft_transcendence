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
-- 1. Create admin role if it does not exist
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin') THEN
      CREATE ROLE admin WITH LOGIN PASSWORD '$USER_SERVICE_DB_ROOT_PASSWORD';
   END IF;
END
\$\$;

-- 2. Create the database if it doesn't exist
SELECT 'CREATE DATABASE $USER_SERVICE_DB_NAME OWNER admin'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = '$USER_SERVICE_DB_NAME'
)\gexec

-- 3. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $USER_SERVICE_DB_NAME TO admin;

-- 4. Set postgres superuser password
ALTER USER postgres WITH PASSWORD '$USER_SERVICE_DB_ROOT_PASSWORD';

-- 5. Switch to new DB and create table
\connect $USER_SERVICE_DB_NAME;

-- 7. Create a app user role
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$USER_SERVICE_DB_USER') THEN
      CREATE ROLE $USER_SERVICE_DB_USER WITH LOGIN PASSWORD '$USER_SERVICE_DB_PASSWORD';
   END IF;
END
\$\$;

ALTER USER $USER_SERVICE_DB_USER CREATEDB;
GRANT ALL PRIVILEGES ON SCHEMA public TO $USER_SERVICE_DB_USER;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE $USER_SERVICE_DB_NAME TO $USER_SERVICE_DB_USER;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE ${USER_SERVICE_DB_NAME}_id_seq TO $USER_SERVICE_DB_USER;

-- Repeat for another service database if needed
-- 1. Create admin role if it does not exist

DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin') THEN
      CREATE ROLE admin WITH LOGIN PASSWORD '$GAME_SERVICE_DB_ROOT_PASSWORD';
   END IF;
END
\$\$;

-- 2. Create the database if it doesn't exist
SELECT 'CREATE DATABASE $GAME_SERVICE_DB_NAME OWNER admin'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = '$GAME_SERVICE_DB_NAME'
)\gexec

-- 3. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $GAME_SERVICE_DB_NAME TO admin;

-- 4. Set postgres superuser password
ALTER USER postgres WITH PASSWORD '$GAME_SERVICE_DB_ROOT_PASSWORD';

-- 5. Switch to new DB and create table
\connect $GAME_SERVICE_DB_NAME;

-- 7. Create a app user role
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$GAME_SERVICE_DB_USER') THEN
      CREATE ROLE $GAME_SERVICE_DB_USER WITH LOGIN PASSWORD '$GAME_SERVICE_DB_PASSWORD';
   END IF;
END
\$\$;

ALTER USER $GAME_SERVICE_DB_USER CREATEDB;
GRANT ALL PRIVILEGES ON SCHEMA public TO $GAME_SERVICE_DB_USER;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE $GAME_SERVICE_DB_NAME TO $GAME_SERVICE_DB_USER;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE ${GAME_SERVICE_DB_NAME}_id_seq TO $GAME_SERVICE_DB_USER;

EOF
#******************************************************************************#
    echo "✅  init.sql created successfully."
#******************************************************************************#
#                       WARPPER FOR THE INIT.SQL SCRIPT                        #
#******************************************************************************#
  #wrapper for the init.sql script
# 
echo "▶️   Starting PostgreSQL temporarily."
su-exec postgres postgres -D "$DATA_DIR"   &
PG_PID=$!

# 
until su-exec postgres pg_isready -q   ; do 
  echo "⏳  Waiting for PostgreSQL to be ready..."
  sleep 1  
done

# 
if [ -f /tmp/init.sql ]; then
    echo "📄  Running /tmp/init.sql"
    su-exec postgres psql -U postgres -f /tmp/init.sql  
    # rm /tmp/init.sql
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


# -- 6. Create a sample table
# CREATE TABLE IF NOT EXISTS $DB_SAMPLE_NAME ( 
#     id SERIAL PRIMARY KEY,
#     username VARCHAR(50) UNIQUE,
#     email VARCHAR(100) UNIQUE,
#     password VARCHAR(255),
#     provider VARCHAR(50) DEFAULT 'local',
#     github_id VARCHAR(50),
#     google_id VARCHAR(50),
#     oauth42_id VARCHAR(50),
#     name VARCHAR(100),
#     first_name VARCHAR(50),
#     last_name VARCHAR(50),
#     avatar_url TEXT,
#     email_2fa BOOLEAN DEFAULT FALSE,
#     autenticator_2fa BOOLEAN DEFAULT FALSE,
#     phone_2fa BOOLEAN DEFAULT FALSE,
#     email_verified BOOLEAN DEFAULT FALSE,
#     phone_verified BOOLEAN DEFAULT FALSE,
#     vault_token VARCHAR(255),
#     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
# );

# -- 8. Grant privileges to $DB_USER
# GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE $DB_SAMPLE_NAME TO $DB_USER;
# GRANT USAGE, SELECT, UPDATE ON SEQUENCE ${DB_SAMPLE_NAME}_id_seq TO $DB_USER;