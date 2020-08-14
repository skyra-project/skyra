# Skyra Dockerfiles

This folder contains all the files required to control Docker development environments for Skyra. Most of the meat of
the content is in the `docker-compose.yml` file which has the info on which images can be build and as which containers
they would be ran. In order to easily control the docker-compose file there is a powershell, `control.ps1`.

Skyra currently has the following microservices that can be dockerized:

-   PostgreSQL Database
    -   Service name in docker-compose: `postgres`
    -   Image used: `skyrabot/postgres:main`
    -   For more information see [skyra-project/docker-images]
-   Lavalink
    -   Service name in docker-compose: `lavalink`
    -   Image used: `skyrabot/lavalink:main`
    -   For more information see [skyra-project/docker-images]
-   GraphQL-Pokémon
    -   Service name in docker-compose: `pokedex`
    -   Image used: `favware/graphql-pokemon:main`
    -   For more information see [favware/graphql-pokemon]
-   Saelem
    -   Service name in docker-compose: `saelem`
    -   Image used: `skyrabot/saelem/saelem:main`
    -   For more information see [skyra-project/saelem]
    -   Additional instructions
        1. Copy the [`.env`] file in [`configs`] directory and rename the copy to [`.env.local`] 2. Fill in `SAELEM_REDIS_PASSWORD` as desired. This should match the values in [`redis.local.conf`] 3. Fill in `SAELEM_REDIS_HOST` as desired. The default of `host.docker.internal` works on Windows and MacOs, for Linux use `172.17.0.1` 3. Fill in `SAELEM_REDIS_DATABASE` as desired, this should be a number between 0 and 16.  
           Note: **_DO NOT edit the SAELEM_REDIS_PORT_**
-   InfluxDB
    -   Service name in docker-compose: `influx`
    -   Image used: `quay.io/influxdb/influxdb:2.0.0-beta`
    -   For more information see [influxdb]
    -   Additional instructions
        1. After starting the InfluxDB container go to [locahost:8285] 1. Create a user to your liking, ensuring you take note of the Organization name and Initial bucket name, you need those for the next two steps - The recommended value for Organization is: `Skyra-Project` - The recommended value for Initial bucket name is: `analytics` 1. In [the config file] set the value of `INFLUX_ORG` to the value of the Organization name 1. In [the config file] set the value of `INFLUX_ORG_ANALYTICS_BUCKET` to the value of the Initial bucket name 1. Once on the InfluxDB homepage click the "Data" tab on the left sidebar 1. Open the "Tokens" tab in the new view 1. Click on your token, which should be YourUsername's Token (YourUsername being what you entered before as the username) 1. Click the "Copy to clipboard" button then paste set that value for `INFLUX_TOKEN` in [the config file]
-   Redis
    -   Service name in docker-compose: `redis`
    -   Image used: `redis:alpine`
    -   For more information see [redis]
    -   Additional instructions
        1. Copy the [`redis.conf`] file in the [`configs`] directory and rename the new file to [`redis.local.conf`] 2. Fill in the password as desired. This should match the values in [`.env.local`]  
           Note: **_DO NOT edit the port!_**

<!-- Link dump -->

[`.env.local`]: ./configs/.env.local
[`.env`]: ./configs/.env
[`configs`]: ./configs/
[`redis.conf`]: ./configs/redis.conf
[`redis.local.conf`]: ./configs/redis.local.conf
[favware/graphql-pokemon]: https://github.com/favware/graphql-pokemon
[influxdb]: https://v2.docs.influxdata.com/v2.0/get-started/#download-and-run-influxdb-v2-0-beta
[locahost:8285]: http://localhost:8285
[redis]: https://hub.docker.com/_/redis
[skyra-project/docker-images]: https://github.com/skyra-project/docker-images
[skyra-project/saelem]: https://github.com/skyra-project/saelem
[the config file]: ../src/config.ts
