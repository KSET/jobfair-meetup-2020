NODE_MODULES := ./node_modules

.PHONY: up dev down install yarn-install build clean restart

stop:
	docker/compose stop

start:
	docker/compose start

up: build
	docker/compose up -d

dev: $(NODE_MODULES)
	docker/yarn dev
	$(MAKE) down

down:
	docker/compose down

restart: down up

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
