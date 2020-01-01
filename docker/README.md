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

# Image Configuration

The following steps are required for each image for it to build on your machine

## Lavalink

1. Download the latest .jar file from https://ci.fredboat.com/viewLog.html?buildId=lastSuccessful&buildTypeId=Lavalink_Build&tab=artifacts&guest=1
2. Drop this .jar file in the 'lavalink' folder
3. Duplicate the 'application.example.yml' file and rename it to 'application.yml'
4. Set any password in the yaml file and also set the same password in config.ts in the root folder of this project

## InfluxDB

1. In the influxdb folder, duplicate the 'config.sample.toml' file and rename it to 'config.toml'

## Postgres

1. Duplicate the `.env.example` file in the `postgres` folder and name it `.env`
2. Fill out any desired values or keep the defaults
