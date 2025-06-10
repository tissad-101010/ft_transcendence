
SRCS=./srcs
COMPOSE=$(SRCS)/docker-compose.yml

start :
	docker-compose -f $(COMPOSE) up -d --build

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

.PHONY: start down restart up clean prune