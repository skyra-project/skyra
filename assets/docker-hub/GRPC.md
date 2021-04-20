<div align="center">

![Skyra Logo](https://cdn.skyra.pw/gh-assets/skyra_avatar.png)

# Skyra Project Grpc

**GRPC Microservice to interact with Skyra Database**

[![Discord](https://discord.com/api/guilds/254360814063058944/embed.png?style=banner2)](https://join.skyra.pw)

</div>

---

**Table of Contents**

-   [Skyra Project Grpc](#skyra-project-grpc)
    -   [Quick reference](#quick-reference)
    -   [How to use this image](#how-to-use-this-image)
        -   [Setting up a Docker Compose file](#setting-up-a-docker-compose-file)
    -   [Using custom configuration](#using-custom-configuration)
        -   [`POSTGRES_PASSWORD`](#postgres_password)
        -   [`POSTGRES_USER`](#postgres_user)
        -   [`POSTGRES_DB`](#postgres_db)
        -   [`POSTGRES_HOST`](#postgres_host)
        -   [`POSTGRES_PORT`](#postgres_port)
    -   [Buy us some doughnuts](#buy-us-some-doughnuts)
    -   [Contributors ✨](#contributors-%E2%9C%A8)

---

## Quick reference

-   **Maintained by**:  
    [Skyra Project](https://github.com/skyra-project)

-   **Where to get help**:  
    [the Skyra Lounge Discord server](https://join.skyra.pw/)

-   **Where to file issues**:  
    [https://github.com/skyra-project/skyra/issues](https://github.com/skyra-project/skyra/issues)

-   **Source of this description**:  
    [Skyra repo `assets/docker-hub` directory](https://github.com/skyra-project/skyra/blob/main/assets/docker-hub/GRPC.md) ([history](https://github.com/skyra-project/skyra/commits/main/assets/docker-hub/GRPC.md))

## How to use this image

### Setting up a Docker Compose file

```yaml
version: '2.4'
services:
    grpc:
        image: skyrabot/grpc:latest
        container_name: 'skyra-grpc'
        depends_on:
            - postgres
        environment:
            - POSTGRES_HOST=postgres
        ports:
            - '8291:80'
    postgres:
        container_name: postgres
        image: skyrabot/postgres:latest
        restart: always
        ports:
            - '5432:5432'
        volumes:
            - postgres-data:/var/lib/postgresql/data
```

[![Try in PWD](https://raw.githubusercontent.com/play-with-docker/stacks/master/assets/images/button.png)](http://play-with-docker.com/?stack=https://raw.githubusercontent.com/skyra-project/skyra/main/assets/docker-hub/playwithdocker-grpc-stack.yml)

## Using custom configuration

Both the GRPC and PostgreSQL images use several environment variables that you can configure.

### `POSTGRES_PASSWORD`

This optional environment variable is used for the `$POSTGRES_USER` to connect to the database. If it is not specified, then the default password of `postgres` will be used.

### `POSTGRES_USER`

This optional environment variable is used in conjunction with `POSTGRES_PASSWORD` to set a user and its password. This variable will create the specified user with superuser power and a database with the same name. If it is not specified, then the default user of `postgres` will be used.

### `POSTGRES_DB`

This optional environment variable can be used to define a different name for the default database that is created when the image is first started. If it is not specified, then the value of `skyra` will be used.

### `POSTGRES_HOST`

This optional environment variable is _only_ for the `skyrabot/grpc` image and can be used to define a different host for the where the database runs relative to the GRPC serivce. If it is not specified, then the value of `localhost` will be used.

### `POSTGRES_PORT`

This optional environment variable is _only_ for the `skyrabot/grpc` image and can be used to define a different port for the where the database runs relative to the GRPC serivce. If it is not specified, then the value of `5432` will be used.

## Buy us some doughnuts

Skyra Project is open source and always will be, even if we don't get donations. That said, we know there are amazing people who
may still want to donate just to show their appreciation. Thanks you very much in advance!

We accept donations through Patreon, BitCoin, Ethereum, and Litecoin. You can use the buttons below to donate through your method of choice.

| Donate With |         QR         |                                                                  Address                                                                  |
| :---------: | :----------------: | :---------------------------------------------------------------------------------------------------------------------------------------: |
|   Patreon   | ![PatreonImage][]  |                                               [Click Here](https://donate.skyra.pw/patreon)                                               |
|   PayPal    |  ![PayPalImage][]  |                                               [Click Here](https://donate.skyra.pw/paypal)                                                |
|   BitCoin   | ![BitcoinImage][]  |         [3JNzCHMTFtxYFWBnVtDM9Tt34zFbKvdwco](bitcoin:3JNzCHMTFtxYFWBnVtDM9Tt34zFbKvdwco?amount=0.01&label=Skyra%20Discord%20Bot)          |
|  Ethereum   | ![EthereumImage][] | [0xcB5EDB76Bc9E389514F905D9680589004C00190c](ethereum:0xcB5EDB76Bc9E389514F905D9680589004C00190c?amount=0.01&label=Skyra%20Discord%20Bot) |
|  Litecoin   | ![LitecoinImage][] |         [MNVT1keYGMfGp7vWmcYjCS8ntU8LNvjnqM](litecoin:MNVT1keYGMfGp7vWmcYjCS8ntU8LNvjnqM?amount=0.01&label=Skyra%20Discord%20Bot)         |

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/kyranet"><img src="https://avatars0.githubusercontent.com/u/24852502?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Antonio Román</b></sub></a><br /><a href="#a11y-kyranet" title="Accessibility">️️️️♿️</a> <a href="#audio-kyranet" title="Audio">🔊</a> <a href="https://github.com/skyra-project/skyra/issues?q=author%3Akyranet" title="Bug reports">🐛</a> <a href="https://github.com/skyra-project/skyra/commits?author=kyranet" title="Code">💻</a> <a href="#design-kyranet" title="Design">🎨</a> <a href="https://github.com/skyra-project/skyra/commits?author=kyranet" title="Documentation">📖</a> <a href="#ideas-kyranet" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-kyranet" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-kyranet" title="Maintenance">🚧</a> <a href="#platform-kyranet" title="Packaging/porting to new platform">📦</a> <a href="#projectManagement-kyranet" title="Project Management">📆</a> <a href="#question-kyranet" title="Answering Questions">💬</a> <a href="https://github.com/skyra-project/skyra/pulls?q=is%3Apr+reviewed-by%3Akyranet" title="Reviewed Pull Requests">👀</a> <a href="#security-kyranet" title="Security">🛡️</a> <a href="https://github.com/skyra-project/skyra/commits?author=kyranet" title="Tests">⚠️</a> <a href="#translation-kyranet" title="Translation">🌍</a></td>
    <td align="center"><a href="https://favware.tech/"><img src="https://avatars3.githubusercontent.com/u/4019718?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jeroen Claassens</b></sub></a><br /><a href="#a11y-Favna" title="Accessibility">️️️️♿️</a> <a href="#audio-Favna" title="Audio">🔊</a> <a href="https://github.com/skyra-project/skyra/issues?q=author%3AFavna" title="Bug reports">🐛</a> <a href="https://github.com/skyra-project/skyra/commits?author=Favna" title="Code">💻</a> <a href="#design-Favna" title="Design">🎨</a> <a href="https://github.com/skyra-project/skyra/commits?author=Favna" title="Documentation">📖</a> <a href="#ideas-Favna" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-Favna" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-Favna" title="Maintenance">🚧</a> <a href="#platform-Favna" title="Packaging/porting to new platform">📦</a> <a href="#projectManagement-Favna" title="Project Management">📆</a> <a href="#question-Favna" title="Answering Questions">💬</a> <a href="https://github.com/skyra-project/skyra/pulls?q=is%3Apr+reviewed-by%3AFavna" title="Reviewed Pull Requests">👀</a> <a href="#security-Favna" title="Security">🛡️</a> <a href="https://github.com/skyra-project/skyra/commits?author=Favna" title="Tests">⚠️</a> <a href="#translation-Favna" title="Translation">🌍</a></td>
    <td align="center"><a href="https://github.com/Stitch07"><img src="https://avatars.githubusercontent.com/u/29275227?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Stitch07</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/issues?q=author%3AStitch07" title="Bug reports">🐛</a> <a href="https://github.com/skyra-project/skyra/commits?author=Stitch07" title="Code">💻</a> <a href="#design-Stitch07" title="Design">🎨</a> <a href="https://github.com/skyra-project/skyra/commits?author=Stitch07" title="Documentation">📖</a> <a href="#ideas-Stitch07" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/skyra-project/skyra/pulls?q=is%3Apr+reviewed-by%3AStitch07" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/skyra-project/skyra/commits?author=Stitch07" title="Tests">⚠️</a> <a href="#translation-Stitch07" title="Translation">🌍</a> <a href="#userTesting-Stitch07" title="User Testing">📓</a></td>
    <td align="center"><a href="https://gideonbot.com/"><img src="https://avatars.githubusercontent.com/u/22133246?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Adrian Castro</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=adrifcastr" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Tylertron1998"><img src="https://avatars0.githubusercontent.com/u/34944514?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tyler Davis</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=Tylertron1998" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Rexogamer"><img src="https://avatars0.githubusercontent.com/u/42586271?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ed L</b></sub></a><br /><a href="#translation-Rexogamer" title="Translation">🌍</a></td>
    <td align="center"><a href="https://github.com/ImmortalSnake"><img src="https://avatars0.githubusercontent.com/u/47276574?v=4?s=100" width="100px;" alt=""/><br /><sub><b>ImmortalSnake</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=ImmortalSnake" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/superusercode"><img src="https://avatars0.githubusercontent.com/u/60588434?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Code.</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=superusercode" title="Code">💻</a></td>
    <td align="center"><a href="http://www.adityatd.me/"><img src="https://avatars0.githubusercontent.com/u/9266227?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aditya N. Tripathi</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/issues?q=author%3AAdityaTD" title="Bug reports">🐛</a> <a href="https://github.com/skyra-project/skyra/commits?author=AdityaTD" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/KunoichiZ"><img src="https://avatars1.githubusercontent.com/u/19984244?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kaoru</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=KunoichiZ" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/YorkAARGH"><img src="https://avatars1.githubusercontent.com/u/20838878?v=4?s=100" width="100px;" alt=""/><br /><sub><b>York</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=YorkAARGH" title="Code">💻</a></td>
    <td align="center"><a href="http://moorewebcode.com/"><img src="https://avatars1.githubusercontent.com/u/25398066?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hutch</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=tech6hutch" title="Code">💻</a></td>
    <td align="center"><a href="https://quantumlytangled.com/"><img src="https://avatars1.githubusercontent.com/u/7919610?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nejc Drobnic</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=QuantumlyTangled" title="Code">💻</a> <a href="https://github.com/skyra-project/skyra/commits?author=QuantumlyTangled" title="Documentation">📖</a> <a href="#ideas-QuantumlyTangled" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-QuantumlyTangled" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#translation-QuantumlyTangled" title="Translation">🌍</a></td>
    <td align="center"><a href="https://github.com/gc"><img src="https://avatars2.githubusercontent.com/u/30398469?v=4?s=100" width="100px;" alt=""/><br /><sub><b>GC</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=gc" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/PyroTechniac"><img src="https://avatars2.githubusercontent.com/u/39341355?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gryffon Bellish</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=PyroTechniac" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/vladfrangu"><img src="https://avatars3.githubusercontent.com/u/17960496?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vlad Frangu</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/issues?q=author%3Avladfrangu" title="Bug reports">🐛</a> <a href="https://github.com/skyra-project/skyra/commits?author=vladfrangu" title="Code">💻</a> <a href="https://github.com/skyra-project/skyra/commits?author=vladfrangu" title="Documentation">📖</a> <a href="https://github.com/skyra-project/skyra/pulls?q=is%3Apr+reviewed-by%3Avladfrangu" title="Reviewed Pull Requests">👀</a> <a href="#translation-vladfrangu" title="Translation">🌍</a> <a href="#userTesting-vladfrangu" title="User Testing">📓</a></td>
    <td align="center"><a href="https://github.com/Skillz4Killz"><img src="https://avatars3.githubusercontent.com/u/23035000?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Skillz4Killz</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=Skillz4Killz" title="Code">💻</a></td>
    <td align="center"><a href="https://jaczaus.me/"><img src="https://avatars3.githubusercontent.com/u/23615291?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jacz</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=MrJacz" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/cfanoulis"><img src="https://avatars3.githubusercontent.com/u/38255093?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Charalampos Fanoulis</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=cfanoulis" title="Code">💻</a> <a href="#ideas-cfanoulis" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-cfanoulis" title="Maintenance">🚧</a> <a href="#projectManagement-cfanoulis" title="Project Management">📆</a> <a href="#translation-cfanoulis" title="Translation">🌍</a></td>
    <td align="center"><a href="https://skyra.pw/"><img src="https://avatars0.githubusercontent.com/u/61647701?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Skyra</b></sub></a><br /><a href="#infra-NM-EEA-Y" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#translation-NM-EEA-Y" title="Translation">🌍</a></td>
    <td align="center"><a href="https://github.com/apps/dependabot-preview"><img src="https://avatars3.githubusercontent.com/in/2141?v=4?s=100" width="100px;" alt=""/><br /><sub><b>dependabot-preview[bot]</b></sub></a><br /><a href="#maintenance-dependabot-preview[bot]" title="Maintenance">🚧</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/apps/dependabot"><img src="https://avatars0.githubusercontent.com/in/29110?v=4?s=100" width="100px;" alt=""/><br /><sub><b>dependabot[bot]</b></sub></a><br /><a href="#maintenance-dependabot[bot]" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/apps/depfu"><img src="https://avatars3.githubusercontent.com/in/715?v=4?s=100" width="100px;" alt=""/><br /><sub><b>depfu[bot]</b></sub></a><br /><a href="#maintenance-depfu[bot]" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/apps/allcontributors"><img src="https://avatars.githubusercontent.com/in/23186?v=4?s=100" width="100px;" alt=""/><br /><sub><b>allcontributors[bot]</b></sub></a><br /><a href="https://github.com/skyra-project/skyra/commits?author=allcontributors[bot]" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

<!----------------- LINKS --------------->

[patreonimage]: https://cdn.skyra.pw/gh-assets/patreon.png
[paypalimage]: https://cdn.skyra.pw/gh-assets/paypal.png
[bitcoinimage]: https://cdn.skyra.pw/gh-assets/bitcoin.png
[ethereumimage]: https://cdn.skyra.pw/gh-assets/ethereum.png
[litecoinimage]: https://cdn.skyra.pw/gh-assets/litecoin.png
