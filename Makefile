
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

test_crs:
	bash test_tools/test_modsec.sh

tls_gen:
	bash srcs/vault/tools/vault-tls-gen.sh

local:
	mkdir -p ./srcs/vault/data
	mkdir -p ./srcs/frontend/build
	mkdir -p ./srcs/./backend/user-service/data
	mkdir -p ./srcs/backend/postgresql/data

	
.PHONY: start down restart up clean prune