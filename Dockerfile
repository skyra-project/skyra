# ================ #
#    Base Stage    #
# ================ #

FROM node:20-alpine as base

WORKDIR /usr/src/app

ENV YARN_DISABLE_GIT_HOOKS=1
ENV CI=true

RUN apk add --no-cache dumb-init python3 g++ make

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node .yarnrc.yml .
COPY --chown=node:node .yarn/ .yarn/

ENTRYPOINT ["dumb-init", "--"]

# ================ #
#   Builder Stage  #
# ================ #

FROM base as builder

ENV NODE_ENV="development"

COPY --chown=node:node tsconfig.base.json tsconfig.base.json
COPY --chown=node:node prisma/ prisma/
COPY --chown=node:node src/ src/

RUN yarn install --immutable
RUN yarn run prisma:generate
RUN yarn run build

# ================ #
#   Runner Stage   #
# ================ #

FROM base AS runner

ENV NODE_ENV="production"
ENV NODE_OPTIONS="--enable-source-maps --max_old_space_size=4096"

COPY --chown=node:node --from=builder /usr/src/app/dist dist

COPY --chown=node:node src/.env src/.env

RUN yarn workspaces focus --all --production

# Patch .prisma with the built files
COPY --chown=node:node --from=builder /usr/src/app/node_modules/.prisma node_modules/.prisma

USER node

CMD [ "yarn", "run", "start" ]
