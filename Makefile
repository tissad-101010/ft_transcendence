
SRCS=./srcs
COMPOSE=$(SRCS)/docker-compose.yml

start : local
	docker-compose -f $(COMPOSE) up --build
build :
	docker-compose -f $(COMPOSE) build



down : 
	docker-compose -f $(COMPOSE) down -v

restart : down start

up : local
	docker-compose -f $(COMPOSE) up


clean :
	docker-compose -f $(COMPOSE) down --rmi all --volumes --remove-orphans
# 	rm -rf ./srcs/frontend/build
prune : clean
	docker system prune -fa
	npm_cache_clean

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
	cp ./srcs/.env ~/.env.local
npm_cache_clean:
	npm cache clean --force
	rm -rf node_modules
	rm -f package-lock.json

.PHONY: start down restart up clean prune