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
# 	rm -rf ./srcs/frontend/build
prune : clean
	docker system prune -fa

test_crs:
	bash test_tools/test_modsec.sh

tls_gen:
	bash srcs/backend/vault/tools/vault-tls-gen.sh

local:
	mkdir -p ./srcs/frontend/build
	mkdir -p ./srcs/frontend/data
	mkdir -p ./srcs/backend/vault/data
	mkdir -p ./srcs/backend/postgresql/data
	mkdir -p ./srcs/backend/services/service-users/data
	mkdir -p ./srcs/backend/services/service-game/data
	mkdir -p ./srcs/backend/services/service-friends/data
	cp ./srcs/.env ~/.env.local
# 	cp ~/sgoinfre/local/env.hdr ./srcs/frontend/public/env.hdr
# 	cp ~/sgoinfre/local/strucLocker.glb srcs/frontend/public/lockerRoom/strucLocker.glb
# 	cp ~/sgoinfre/local/strucPool.glb srcs/frontend/public/pool/strucPool.glb
# 	cp ~/sgoinfre/local/strucField.glb srcs/frontend/public/field/strucField.glb
	
npm_cache_clean:
	npm cache clean --force
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