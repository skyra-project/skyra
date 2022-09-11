# Skyra Dockerfiles

This folder contains all the files required to control Docker development environments for Skyra. Most of the meat of
the content is in the `docker-compose.yml` file which has the info on which images can be build and as which containers
they would be ran. In order to easily control the docker-compose file there is a powershell, `control.ps1`.

Skyra currently has the following microservices that can be dockerized:

-   PostgreSQL Database
    -   Service name in docker-compose: `postgres`
    -   Image used: `skyrabot/postgres:latest`
    -   For more information see [skyra-project/docker-images]
-   InfluxDB
    -   Service name in docker-compose: `influx`
    -   Image used: `quay.io/influxdb/influxdb:2.0.0-beta`
    -   For more information see [influxdb]
    -   Additional instructions
        1. After starting the InfluxDB container go to [locahost:8285]
        1. Create a user to your liking, ensuring you take note of the Organization name and Initial bucket name, you need those for the next two steps - The recommended value for Organization is: `Skyra-Project` - The recommended value for Initial bucket name is: `analytics`
        1. In [the config file] set the value of `INFLUX_ORG` to the value of the Organization name
        1. In [the config file] set the value of `INFLUX_ORG_ANALYTICS_BUCKET` to the value of the Initial bucket name
        1. Once on the InfluxDB homepage click the "Data" tab on the left sidebar
        1. Open the "Tokens" tab in the new view
        1. Click on your token, which should be YourUsername's Token (YourUsername being what you entered before as the username)
        1. Click the "Copy to clipboard" button then paste set that value for `INFLUX_TOKEN` in [the config file]
-   Redis
    -   Service name in docker-compose: `redis`
    -   Image used: `redis:alpine`
    -   For more information see [redis]
-   Hasteserver
    -   Service name in docker-compose: `hasteserver`
    -   Image used: `skyrabot/haste-server:latest`
    -   For more information see [skyra-project/docker-images]

<!-- Link dump -->

[`.env.local`]: ./configs/.env.local
[`.env`]: ./configs/.env
[`configs`]: ./configs/
[`redis.conf`]: ./configs/redis.conf
[`redis.local.conf`]: ./configs/redis.local.conf
[influxdb]: https://v2.docs.influxdata.com/v2.0/get-started/#download-and-run-influxdb-v2-0-beta
[locahost:8285]: http://localhost:8285
[redis]: https://hub.docker.com/_/redis
[skyra-project/docker-images]: https://github.com/skyra-project/docker-images
[the config file]: ../src/config.ts
