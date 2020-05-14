NODE_MODULES := ./node_modules

.PHONY: stop start up prod dev down restart reboot rebuild install yarn-install build clean build-containers

stop:
	docker/compose stop

start:
	docker/compose start

up:
	docker/compose up -d

prod: build reboot

dev: $(NODE_MODULES)
	docker/yarn dev || exit 0
	$(MAKE) down

down:
	docker/compose down

restart: stop start

reboot: down up

rebuild: build restart

install: clean yarn-install

yarn-install:
	docker/yarn install

build: yarn-install
	docker/yarn build

clean:
	rm -rf $(NODE_MODULES) .nuxt

build-containers:
	docker/compose build

$(NODE_MODULES): yarn-install
