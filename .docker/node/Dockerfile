FROM node:14-alpine

ENV APP_ROOT /web

RUN mkdir ${APP_ROOT}
WORKDIR ${APP_ROOT}

RUN apk update \
    # Required for Vuetify's Fibers dependency
    && apk add make python3 g++

RUN apk update \
    # Required for image optimisation
    && apk add optipng libtool automake autoconf nasm build-base

CMD ["node"]
