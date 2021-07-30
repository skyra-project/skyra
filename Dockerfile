FROM node:16-buster-slim as BUILDER

WORKDIR /usr/src/app

ENV NODE_ENV="development"
ENV HUSKY=0

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node tsconfig.base.json tsconfig.base.json
COPY --chown=node:node assets/ assets/
COPY --chown=node:node scripts/ scripts/
COPY --chown=node:node src/ src/

RUN sed -i 's/"prepare": "husky install .github\/husky"/"prepare": ""/' ./package.json \
    && yarn install --production=false --frozen-lockfile --link-duplicates \
    && yarn build

# ================ #
#   Runner Stage   #
# ================ #

FROM node:16-buster-slim AS RUNNER

ENV NODE_ENV="production"

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    apt-get install -y --no-install-recommends \
    dumb-init \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --chown=node:node --from=BUILDER /usr/src/app/dist dist

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node assets/ assets/
COPY --chown=node:node scripts/audio/ scripts/audio/
COPY --chown=node:node scripts/build/ scripts/build/
COPY --chown=node:node scripts/workerTsLoader.js scripts/workerTsLoader.js
COPY --chown=node:node src/.env src/.env

RUN sed -i 's/"prepare": "husky install .github\/husky"/"prepare": ""/' ./package.json \
    && yarn install --production=true --frozen-lockfile --link-duplicates \
    && yarn cache clean

USER node

CMD [ "dumb-init", "yarn", "start", "--enable-source-maps", "--max-old-space-size=4096"]
