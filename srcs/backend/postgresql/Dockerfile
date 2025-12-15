# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: tissad <tissad@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/07/31 14:24:00 by tissad            #+#    #+#              #
#    Updated: 2025/12/15 13:36:38 by tissad           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# PostgreSQL Dockerfile
FROM alpine:3.22

# install PostgreSQL and dependencies
RUN apk update && apk add --no-cache \
    su-exec \
    bash \
    postgresql16 \
    postgresql16-contrib \
    tzdata \
    sed \
    curl
RUN apk add curl unzip bash jq \
    && curl -fsSL https://releases.hashicorp.com/vault/1.12.2/vault_1.12.2_linux_amd64.zip -o vault.zip \
    && unzip vault.zip \
    && mv vault /usr/local/bin/ \
    && rm vault.zip

# Set the repository for PostgreSQL data
RUN mkdir -p /var/lib/postgresql /var/run/postgresql && \
    chown -R postgres:postgres /var/lib/postgresql /var/run/postgresql

# copy the entrypoint script

COPY ./config/vault_agent.hcl /tmp/vault_agent.hcl
COPY ./tools/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh
    
# Set working directory
WORKDIR /var/lib/postgresql

# Port configuration
EXPOSE 5432

# Initialize the database
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
