FROM node:15-alpine

ENV APP_ROOT /web

RUN mkdir ${APP_ROOT}
WORKDIR ${APP_ROOT}

RUN apk update \
    # Required for Vuetify's Fibers dependency
    && apk add make python2 g++

CMD ["node"]
