# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: tissad <tissad@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/21 10:55:49 by tissad            #+#    #+#              #
#    Updated: 2025/02/28 15:30:39 by tissad           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

#******************************************************************************#
#                             REDIS DOCKERFILE                                 #
#******************************************************************************#

# use the alpine image
FROM alpine:3.20

# Install redis and create the /data directory
RUN apk add --no-cache redis \
	&& mkdir /data 

# Set the working directory
WORKDIR /etc/redis

# Copy the configuration file
COPY ./conf/redis.conf /etc/redis/redis.conf

# Copy the entrypoint.sh file
COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Execute the entrypoint.sh file
ENTRYPOINT ["/entrypoint.sh"]
# ***************************************************************************** #
