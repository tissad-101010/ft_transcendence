
SRCS=./srcs
COMPOSE=$(SRCS)/docker-compose.yml

start :
	docker-compose -f $(COMPOSE) up --build

down :
	docker-compose -f $(COMPOSE) down -v

restart : down start


up :
	docker-compose -f $(COMPOSE) up 

clean :
	docker-compose -f $(COMPOSE) down --rmi all --volumes --remove-orphans
prune :
	docker system prune -fa

.PHONY: start down restart up clean prune