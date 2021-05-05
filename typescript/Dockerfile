FROM --platform=linux/amd64 node:15-buster-slim as BUILDER

WORKDIR /usr/src/app

ENV NODE_ENV="development"

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node tsconfig.base.json tsconfig.base.json
COPY --chown=node:node assets/ assets/
COPY --chown=node:node scripts/ scripts/
COPY --chown=node:node typescript/src/ typescript/src/

RUN yarn install --production=false --frozen-lockfile --link-duplicates

RUN yarn build

# ================ #
#   Runner Stage   #
# ================ #

FROM --platform=linux/amd64 node:15-buster-slim AS RUNNER

ENV NODE_ENV="production"

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
    build-essential \
    dumb-init \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev

COPY --chown=node:node --from=BUILDER /usr/src/app/typescript/dist typescript/dist

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node assets/ assets/
COPY --chown=node:node scripts/audio/ scripts/audio/
COPY --chown=node:node scripts/build/ scripts/build/
COPY --chown=node:node scripts/workerTsLoader.js scripts/workerTsLoader.js
COPY --chown=node:node typescript/src/package.json typescript/src/package.json
COPY --chown=node:node typescript/src/.env typescript/src/.env

RUN yarn install --production=true --frozen-lockfile --link-duplicates

USER node

CMD [ "dumb-init", "yarn", "start", "--enable-source-maps"]
