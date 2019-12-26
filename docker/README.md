# Skyra Dockerfiles

This folder contains all the files required to control Docker development environments for Skyra. Most of the meat of
the content is in the `docker-compose.yml` file which has the info on which images can be build and as which containers
they would be ran. In order to easily control the docker-compose file there are powershell and bash scripts:
`ps-skyra.ps1` and `bash-skyra.sh`. You can call these scripts with yarn through `yarn dockerps` and `yarn dockerbash`
respectively.

Skyra currently has the following microservices that can be dockerized:

- PostgreSQL Database
  - Service name in docker-compose: `postgres`
  - Image used: `postgres`
- Lavalink
  - Service name in docker-compose: `lavalink`
  - Image used: `skyrabot/lavalink`
- Graphql-Pokémon
  - Service name in docker-compose: `pokedex`
  - Image used: `favware/graphql-pokemon`
- InfluxDB
  - Service name in docker-compose: `influxdb`
  - Image used: `skyrabot/influxdb`
