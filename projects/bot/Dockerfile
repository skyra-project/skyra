# ================ #
#    Base Stage    #
# ================ #

FROM node:16-buster-slim as base

WORKDIR /usr/src/app

ENV HUSKY=0
ENV CI=true

RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    apt-get install -y --no-install-recommends build-essential python3 libfontconfig1 dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node projects/bot/package.json projects/bot/package.json
COPY --chown=node:node .yarnrc.yml .
COPY --chown=node:node .yarn/ .yarn/

ENTRYPOINT ["dumb-init", "--"]

# ================ #
#   Builder Stage  #
# ================ #

FROM base as builder

ENV NODE_ENV="development"

COPY --chown=node:node tsconfig.base.json tsconfig.base.json
COPY --chown=node:node scripts/ scripts/
COPY --chown=node:node projects/bot/scripts/ projects/bot/scripts/
COPY --chown=node:node projects/bot/src/ projects/bot/src/

RUN yarn install --immutable
RUN cd projects/bot/ && yarn run build

# ================ #
#   Runner Stage   #
# ================ #

FROM base AS runner

ENV NODE_ENV="production"
ENV NODE_OPTIONS="--enable-source-maps --max_old_space_size=4096"

COPY --chown=node:node projects/bot/scripts/workerTsLoader.js projects/bot/scripts/workerTsLoader.js
COPY --chown=node:node projects/bot/src/.env projects/bot/src/.env
COPY --chown=node:node --from=builder /usr/src/app/projects/bot/dist projects/bot/dist

RUN yarn workspaces focus --all --production
RUN chown node:node /usr/src/app/

USER node

WORKDIR /usr/src/app/projects/bot

CMD [ "yarn", "run", "start" ]
