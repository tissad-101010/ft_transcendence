# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: tissad <tissad@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/07/29 14:29:29 by tissad            #+#    #+#              #
#    Updated: 2025/07/29 15:01:17 by tissad           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# stable version of HashiCorp Vault
FROM hashicorp/vault:1.12.2

RUN apk add --no-cache bash curl jq

# Set the working directory
RUN mkdir -p /vault/config /vault/certs /vault/data /vault/tools

WORKDIR /vault


COPY ./tools/entrypoint.sh ./tools/entrypoint.sh
RUN chmod +x ./tools/entrypoint.sh

ENTRYPOINT [ "./tools/entrypoint.sh" ]