# Skyra Dockerfiles

This folder contains all the files required to control Docker development environments for Skyra. Most of the meat of
the content is in the `docker-compose.yml` file which has the info on which images can be build and as which containers
they would be ran. In order to easily control the docker-compose file there is a powershell, `control.ps1`.

Skyra currently has the following microservices that can be dockerized:

- PostgreSQL Database
  - Service name in docker-compose: `postgres`
  - Image used: `docker.pkg.github.com/skyra-project/docker-images/postgres:master`
  - For more information see [skyra-project/docker-images]
- Lavalink
  - Service name in docker-compose: `lavalink`
  - Image used: `docker.pkg.github.com/skyra-project/docker-images/lavalink:master`
  - For more information see [skyra-project/docker-images]
- GraphQL-Pokémon
  - Service name in docker-compose: `pokedex`
  - Image used: `docker.pkg.github.com/favware/graphql-pokemon/graphql-pokemon:master`
  - For more information see [favware/graphql-pokemon]

<!-- Link dump -->

[skyra-project/docker-images]: https://github.com/skyra-project/docker-images
[favware/graphql-pokemon]:     https://github.com/favware/graphql-pokemon