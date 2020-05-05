# Skyra [![Discord](https://discordapp.com/api/guilds/254360814063058944/embed.png)](https://join.skyra.pw)

[![Total alerts](https://img.shields.io/lgtm/alerts/g/skyra-project/skyra.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/skyra-project/skyra/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/skyra-project/skyra.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/skyra-project/Skyra/context:javascript)
[![Status](https://top.gg/api/widget/status/266624760782258186.svg?noavatar=true)](https://top.gg/bot/266624760782258186)
[![Servers](https://top.gg/api/widget/servers/266624760782258186.svg?noavatar=true)](https://top.gg/bot/266624760782258186)
[![Upvotes](https://top.gg/api/widget/upvotes/266624760782258186.svg?noavatar=true)](https://top.gg/bot/266624760782258186)

## Developing on Skyra

### Requirements

-   [`Node.js`]: To run the project.
-   [`PostgreSQL`]: (Dev Optional) To store persistent data.
-   [`Lavalink`]: (Dev Optional) Audio server.

### [Set-Up - Refer to CONTRIBUTING.md]

## A note to aspiring developers who want to self host Skyra

We are not supportive of the idea of people self hosting Skyra as we put a very high priority on providing the best experience we can for our end-users. This image of Skyra will be diminished if people self-host her as they will not use identical architecture to what we do and likely not put in the same amount of effort as we do. If Skyra is lacking a feature you'd like to see, please refer to the developing guidelines above and if you can add that feature it will be in Skyra to stay.

Furthermore, Skyra has not been build with the idea of self hosting in mind and she makes use of many services that you will need to maintain in a production environment for full functionality. For example
- Skyra uses many external API's for which you would have to create API keys
- Skyra uses Lavalink as music module, this means you need to host your own instance of Lavalink (a Java application)
- While Skyra can work with a JSON based database, it is extremely ill-advised to do so in production. Instead in production you should be using PostgreSQL, another thing to host yourself.
- Skyra requires [Evlyn] in order to run properly, this means you will also need to host this Node.JS application on the same network as Skyra

All this said, if you really are going to self-host Skyra please take heed, she ***will absolutely not*** run on services such as [Glitch] or [Heroku]. You ***will need*** a VPS (Virtual Private Server), for example from a provider such as [Netcup] (our provider) or [DigitalOcean].

Sidenote, if you really think you're clever enough to self host then you're probably also smart enough to write your own bot.

## Story

**A bit of story**: Skyra, formerly known as kyraBOT (renamed in the middle of March of 2017), is a multipurpose Discord
Bot that was born out of curiosity in a SoloLearn guild. With help from other developers, due to my lack of experience
(I made websites and templates for After Effects, but never a backend application). Skyra was born. Skyra's name comes
from a comment made by a user, joining "kyra" with "SkyNET", creating "SkyraNET", I liked the name and later, she got
renamed to "Skyra". Originally, it was going to be renamed as "Shiny" (name taken for the currency) or "Shyy" (original
name from the lore) however I decided "Skyra" would be a better name.

Skyra does not only feature almost every feature that is needed in the majority of guilds (discord servers) while being
completely configurable, she also has a backstory, inherited from the lore I have been creating since I was a child.

There have been over 13 rewrites with an active development of over two years, I have met many developers and friends in
Discord, and in February 2017, I met the Dirigeants team, upon which I started to contribute to Komada, and later, for
Klasa.

_Who knows, I might write a book someday for Skyra's lore._

## Links

**Skyra links**

-   [Skyra Invite Link]
-   [Support Server]
-   [Patreon]

**Framework links**

-   [Klasa's Website]

## Buy us some donuts

Skyra Project is open source and always will be, even if we don't get donations. That said, we know there are amazing people who
may still want to donate just to show their appreciation. Thanks you very much in advance!

We accept donations through Patreon, BitCoin, Ethereum, and Litecoin. You can use the buttoms below to donate through your method of choice.

| Donate With |         QR         |                                                                  Address                                                                  |
| :---------: | :----------------: | :---------------------------------------------------------------------------------------------------------------------------------------: |
|   Patreon   | ![PatreonImage][]  |                                               [Click Here](https://www.patreon.com/kyranet)                                               |
|   PayPal    | ![PayPalImage][]   |                [Click Here](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CET28NRZTDQ8L)                |
|   BitCoin   | ![BitcoinImage][]  |         [3JNzCHMTFtxYFWBnVtDM9Tt34zFbKvdwco](bitcoin:3JNzCHMTFtxYFWBnVtDM9Tt34zFbKvdwco?amount=0.01&label=Skyra%20Discord%20Bot)          |
|  Ethereum   | ![EthereumImage][] | [0xcB5EDB76Bc9E389514F905D9680589004C00190c](ethereum:0xcB5EDB76Bc9E389514F905D9680589004C00190c?amount=0.01&label=Skyra%20Discord%20Bot) |
|  Litecoin   | ![LitecoinImage][] |         [MNVT1keYGMfGp7vWmcYjCS8ntU8LNvjnqM](litecoin:MNVT1keYGMfGp7vWmcYjCS8ntU8LNvjnqM?amount=0.01&label=Skyra%20Discord%20Bot)         |

<!----------------- LINKS --------------->

[`node.js`]:                         https://nodejs.org/en/download/current/
[`postgresql`]:                      https://www.postgresql.org/download/
[`lavalink`]:                        https://github.com/Frederikam/Lavalink

[Set-Up - Refer to CONTRIBUTING.md]: /.github/CONTRIBUTING.md
[Evlyn]:                             https://github.com/kyranet/Evlyn
[Glitch]:                            https://glitch.com/
[Heroku]:                            https://www.heroku.com/
[Netcup]:                            https://www.netcup.eu/
[DigitalOcean]:                      https://www.digitalocean.com/

[skyra invite link]:                 https://skyra.pw/invite
[support server]:                    https://join.skyra.pw
[patreon]:                           https://www.patreon.com/kyranet

[klasa's website]:                   https://klasa.js.org

[patreonimage]:                      https://raw.githubusercontent.com/skyra-project/Skyra/master/assets/github/patreon.png
[paypalimage]:                       https://raw.githubusercontent.com/skyra-project/Skyra/master/assets/github/paypal.png
[bitcoinimage]:                      https://raw.githubusercontent.com/skyra-project/Skyra/master/assets/github/bitcoin.png
[ethereumimage]:                     https://raw.githubusercontent.com/skyra-project/Skyra/master/assets/github/ethereum.png
[litecoinimage]:                     https://raw.githubusercontent.com/skyra-project/Skyra/master/assets/github/litecoin.png
