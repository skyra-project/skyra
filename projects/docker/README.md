# Skyra Dockerfiles

This folder contains all the files required to control Docker development environments for Skyra. Most of the meat of
the content is in the `docker-compose.yml` file which has the info on which images can be build and as which containers
they would be ran. In order to easily control the docker-compose file there is a powershell, `control.ps1`.

Skyra currently has the following microservices that can be dockerized:

-   PostgreSQL Database
    -   Service name in docker-compose: `postgres`
    -   Image used: `skyrabot/postgres:latest`
    -   For more information see [skyra-project/docker-images]
-   Redis
    -   Service name in docker-compose: `redis`
    -   Image used: `redis:alpine`
    -   For more information see [redis]

<!-- Link dump -->

[redis]: https://hub.docker.com/_/redis
[skyra-project/docker-images]: https://github.com/skyra-project/docker-images
