# Skyra [![Discord](https://discord.com/api/guilds/254360814063058944/embed.png)](https://join.skyra.pw)

[![Total alerts](https://img.shields.io/lgtm/alerts/g/skyra-project/skyra.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/skyra-project/skyra/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/skyra-project/skyra.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/skyra-project/Skyra/context:javascript)
[![Codecov .NET](https://img.shields.io/codecov/c/github/skyra-project/skyra/main?flag=dotnet&label=.NET%20Code%20Coverage&logo=codecov&token=DYhRX6ailX)](https://codecov.io/gh/skyra-project/skyra/)
[![Codecov NodeJS](https://img.shields.io/codecov/c/github/skyra-project/skyra/main?flag=nodejs&label=NodeJS%20Code%20Coverage&logo=codecov&token=DYhRX6ailX)](https://codecov.io/gh/skyra-project/skyra/)
[![Status](https://top.gg/api/widget/status/266624760782258186.svg?noavatar=true)](https://top.gg/bot/266624760782258186)
[![Servers](https://top.gg/api/widget/servers/266624760782258186.svg?noavatar=true)](https://top.gg/bot/266624760782258186)
[![Upvotes](https://top.gg/api/widget/upvotes/266624760782258186.svg?noavatar=true)](https://top.gg/bot/266624760782258186)

## Developing on Skyra

### Requirements

-   [`Node.js`]: To run the project.
-   [`PostgreSQL`]: To store persistent data.

### Optional additions

-   [`Lavalink`]: Audio server.
-   [`InfluxDB`]: Metrics platform
-   [`GraphQL-Pokemon`]: Pokemon API
-   [`Saelem`]: Horoscope API
-   [`Redis`]: Caching for [`Saelem`] and queueing for [`Lavalink`]

### [Set-Up - Refer to CONTRIBUTING.md]

## Translating Skyra <a href="https://translation.skyra.pw" target="_blank"><img src="https://support.crowdin.com/assets/logos/crowdin-TranslationManagementService-logo-onecolor.png" align="right" width="30%"></a>

We use **Crowdin** to translate Skyra's messages into different languages. If you'd like to help by contributing new translations (or improving existing ones), [**click here.**](https://translation.skyra.pw) Thanks for any contributions!

## A note to aspiring developers who want to self host Skyra

The developer team does not support the idea of other self-hosted instances of Skyra. The team prides itself on providing the best experience and support for the end-users. As such, an offshoot or unaffiliated mirror of Skyra may cause ill effects to the reputation and image of Skyra. If you wish to see new features implemented, please refer to the developing guidelines linked above.

In addition, Skyra was built with a dependence on many services which need consistent maintenance and oversight in order to function and behave properly. These include, but are not limited to,

-    [`Lavalink`] as music module, this means you need to host your own instance of Lavalink (a Java application)
-    [`Redis`] for the music queue, and as a cache for [`Saelem`]
-    [`InfluxDB`] for keeping anonymous metrics of how she is being used
-    [`PostgreSQL`] as database.
-    Other external APIs, each requiring their own individual API keys

With this in mind, it is also worth noting that Skyra will in no way be capable of running on services such as [Glitch] or [Heroku]. A dedicated VPS (Virtual Private Server) is required in order to maintain the proper production environment.

## Story

**A bit of story**: Skyra, formerly known as kyraBOT (renamed in the middle of March of 2017), is a multipurpose Discord
Bot that was born out of curiosity in a SoloLearn guild. With help from other developers, due to my lack of experience
(I made websites and templates for After Effects, but never a backend application). Skyra was born. Skyra's name comes
from a comment made by a user, joining "kyra" with "SkyNET", creating "SkyraNET", I liked the name and later, she got
renamed to "Skyra". Originally, it was going to be renamed as "Shiny" (name taken for the currency) or "Shyy" (original
name from the lore) however I decided "Skyra" would be a better name.

Skyra does not only feature almost every feature that is needed in the majority of guilds (discord servers) while being
completely configurable, she also has a backstory, inherited from the lore I have been creating since I was a child.

There have been over 14 rewrites with an active development of over two years, I have met many developers and friends in
Discord, and in February 2017, I met the Dirigeants team, upon which I started to contribute to Komada, and later, for
Klasa. And later in September 2020 I split from Dirigeants along with many of these developers and friends and started [Sapphire Project][],
which is what Skyra is currently using, specifically [Sapphire Framework][]

_Who knows, I might write a book someday for Skyra's lore._

## Links

**Skyra links**

-   [Skyra Invite Link][]
-   [Support Server][]
-   [Patreon]

**Framework links**

-   [Sapphire's Website][]

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

[`node.js`]: https://nodejs.org/en/download/current/
[`postgresql`]: https://www.postgresql.org/download/
[`lavalink`]: https://github.com/Frederikam/Lavalink
[`influxdb`]: https://v2.docs.influxdata.com/v2.0/get-started/
[`graphql-pokemon`]: https://github.com/favware/graphql-pokemon
[`saelem`]: https://github.com/skyra-project/saelem
[`redis`]: https://redis.io
[set-up - refer to contributing.md]: /.github/CONTRIBUTING.md
[glitch]: https://glitch.com/
[heroku]: https://www.heroku.com/
[netcup]: https://www.netcup.eu/
[digitalocean]: https://www.digitalocean.com/
[skyra invite link]: https://invite.skyra.pw
[support server]: https://join.skyra.pw
[patreon]: https://donate.skyra.pw/patreon
[sapphire project]: https://github.com/sapphire-project
[sapphire framework]: https://github.com/sapphire-project/framework
[sapphire's website]: https://website.sapphire-project.vercel.app
[patreonimage]: https://cdn.skyra.pw/gh-assets/patreon.png
[paypalimage]: https://cdn.skyra.pw/gh-assets/paypal.png
[bitcoinimage]: https://cdn.skyra.pw/gh-assets/bitcoin.png
[ethereumimage]: https://cdn.skyra.pw/gh-assets/ethereum.png
[litecoinimage]: https://cdn.skyra.pw/gh-assets/litecoin.png
