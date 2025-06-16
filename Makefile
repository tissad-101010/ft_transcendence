
SRCS=./srcs
COMPOSE=$(SRCS)/docker-compose.yml

start :
	docker-compose -f $(COMPOSE) up -d --build
build :
	docker-compose -f $(COMPOSE) build



down :
	docker-compose -f $(COMPOSE) down -v

restart : down start

up :
	docker-compose -f $(COMPOSE) up


clean :
	docker-compose -f $(COMPOSE) down --rmi all --volumes --remove-orphans
prune :
	docker system prune -fa

test_crs:
	bash test_tools/test_modsec.sh

tls_gen:
	bash srcs/vault/tools/vault-tls-gen.sh

.PHONY: start down restart up clean prune