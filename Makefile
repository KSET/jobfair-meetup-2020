NODE_MODULES := ./node_modules
DB_CONTAINER := meetup-db
WEB_CONTAINER := nuxt
BUILD_OUTPUT_DIR := .nuxt.tmp
FINAL_OUTPUT_DIR := .nuxt

.PHONY: stop start up up-db up-web prod dev down down-web restart restart-web reboot reboot-web rebuild install yarn-install build clean build-containers

stop:
	docker/compose stop

start:
	docker/compose start

up:
	docker/compose up -d

up-db:
	docker/compose up -d $(DB_CONTAINER)

prod: build reboot

dev: $(NODE_MODULES) up-db
	docker/yarn dev || exit 0
	$(MAKE) down

down:
	docker/compose down

restart: stop start

restart-web:
	docker/compose restart $(WEB_CONTAINER)

reboot: down up

rebuild: build restart

install: clean yarn-install

yarn-install:
	docker/yarn install

build: yarn-install
	docker/yarn build -c nuxt.config.build
	rm -rf "$(FINAL_OUTPUT_DIR)"
	mv "$(BUILD_OUTPUT_DIR)" "$(FINAL_OUTPUT_DIR)"

clean:
	rm -rf $(NODE_MODULES) .nuxt

build-containers:
	docker/compose build

$(NODE_MODULES): yarn-install
