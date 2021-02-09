NODE_MODULES := ./node_modules
DB_CONTAINER := meetup-db
WEB_CONTAINER := nuxt
BUILD_OUTPUT_DIR := .nuxt.tmp
FINAL_OUTPUT_DIR := .nuxt
GOTIFY_APP_TOKEN := A-h6rNx7X51jjF.

.PHONY: stop start up up-db up-web prod dev down down-web restart restart-web reboot reboot-web rebuild install yarn-install build clean build-containers

stop:
	docker/compose stop

start:
	docker/compose start

up:
	docker/compose up -d

up-db:
	docker/compose up -d $(DB_CONTAINER)

prod: notify-start build reboot notify-end

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

notify-start:
	@curl \
		"https://gotify.josip.igr.ec/message?token=$(GOTIFY_APP_TOKEN)" \
		-F "title=[Meetup] Build počeo" \
		-F "message=Build na Meetupu je započeo na \`$(shell hostname)'" \
		-F "priority=5" &>/dev/null \
	|| exit 0

notify-end:
	@curl \
		"https://gotify.josip.igr.ec/message?token=$(GOTIFY_APP_TOKEN)" \
		-F "title=[Meetup] Build završio" \
		-F "message=Build na Meetupu je završio na \`$(shell hostname)'" \
		-F "priority=5" &>/dev/null \
	|| exit 0

notify-failed:
	@curl \
		"https://gotify.josip.igr.ec/message?token=$(GOTIFY_APP_TOKEN)" \
		-F "title=[Meetup] Build pukao" \
		-F "message=Build na Meetupu je pukao na \`$(shell hostname)'" \
		-F "priority=10" &>/dev/null \
	|| exit 0

yarn-install:
	docker/yarn install

build: yarn-install
	mkdir -p "$(FINAL_OUTPUT_DIR)" && \
	docker/yarn build -c nuxt.config.build && \
	mv "$(FINAL_OUTPUT_DIR)" "$(FINAL_OUTPUT_DIR).old" && \
	mv "$(BUILD_OUTPUT_DIR)" "$(FINAL_OUTPUT_DIR)" && \
	rm -rf "$(FINAL_OUTPUT_DIR).old" \
	|| $(MAKE) notify-failed

clean:
	rm -rf $(NODE_MODULES) .nuxt

build-containers:
	docker/compose build

$(NODE_MODULES): yarn-install
