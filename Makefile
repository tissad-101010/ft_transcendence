SRCS=./srcs
COMPOSE=$(SRCS)/docker-compose.yml

start : local
	docker compose -f $(COMPOSE) up --build
build :
	docker compose -f $(COMPOSE) build

down : 
	docker compose -f $(COMPOSE) down -v

restart : down start

up : local
	docker compose -f $(COMPOSE) up


clean :
	docker compose -f $(COMPOSE) down --rmi all --volumes --remove-orphans
prune : clean
	docker system prune -fa

test_crs:
	bash test_tools/test_modsec.sh

tls_gen:
	bash srcs/backend/vault/tools/vault-tls-gen.sh

local:
	mkdir -p ./srcs/frontend/build
	mkdir -p ./srcs/frontend/data
	mkdir -p ~/data/vault
	mkdir -p ~/data/postgresql
	mkdir -p ~/data/service-users
	mkdir -p ~/data/service-game
	mkdir -p ~/data/service-friends
	mkdir -p ~/data/service-chat
	cp ./srcs/.env ~/.env.local
	cp ~/secret/postgres/secret_id ~/data/postgresql/vault_agent/secret_id
	cp ~/secret/service_user/secret_id ~/data/secrets/user/secret_id
	cp ~/secret/service_chat/secret_id ~/data/secrets/chat/secret_id             
	cp ~/secret/service_friends/secret_id ~/data/secrets/friends/secret_id 
	cp ~/secret/service_game/secret_id ~/data/secrets/game/secret_id
	cp ~/sgoinfre/local/env.hdr ./srcs/frontend/public/env.hdr
	cp ~/sgoinfre/local/strucLocker.glb srcs/frontend/public/lockerRoom/strucLocker.glb
	cp ~/sgoinfre/local/strucPool.glb srcs/frontend/public/pool/strucPool.glb
	cp ~/sgoinfre/local/strucField.glb srcs/frontend/public/field/strucField.glb


vault_start:
	docker compose -f vault/docker-compose.yml up --build -d
vault_down:
	docker compose -f vault/docker-compose.yml down -v
vault_clean:
	docker compose -f vault/docker-compose.yml down --rmi all --volumes --remove-orphans
vault_prune: vault clean
	docker system prune -fa


friends:
	docker compose -f srcs/docker-compose.yml up service-friends --build
postgresql:
	docker compose -f srcs/docker-compose.yml up postgreSQL --build
chat:
	docker compose -f srcs/docker-compose.yml up service-chat --build

game:
	docker compose -f srcs/docker-compose.yml up service-game --build
proxy:
	docker compose -f srcs/docker-compose.yml up proxy --build
.PHONY: start down restart up clean prune