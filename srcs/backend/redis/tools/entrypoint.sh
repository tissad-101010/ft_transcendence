#!/bin/sh
# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    etrypoint.sh                                       :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: tissad <tissad@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/21 10:59:30 by tissad            #+#    #+#              #
#    Updated: 2025/02/21 10:59:39 by tissad           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #
#                                 REDIS                                        #
# **************************************************************************** #
# Start the Redis server
# The Redis server is started with the configuration file /etc/redis/redis.conf
set -e
echo "[🚀 ENTRYPOINT: ⚙️  Configuration of Redis]"
# Start the Redis server
echo "[🚀 ENTRYPOINT: ▶️  Starting Redis]"
exec redis-server /etc/redis/redis.conf
# **************************************************************************** #