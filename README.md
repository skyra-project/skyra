# Skyra [![Discord](https://discordapp.com/api/guilds/254360814063058944/embed.png)](https://join.skyra.pw)

[![Total alerts](https://img.shields.io/lgtm/alerts/g/skyra-project/skyra.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/skyra-project/skyra/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/skyra-project/skyra.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/skyra-project/Skyra/context:javascript)
[![Discord Bots](https://discordbots.org/api/widget/status/266624760782258186.svg?noavatar=true)](https://discordbots.org/bot/266624760782258186)
[![Discord Bots](https://discordbots.org/api/widget/servers/266624760782258186.svg?noavatar=true)](https://discordbots.org/bot/266624760782258186)
[![Discord Bots](https://discordbots.org/api/widget/upvotes/266624760782258186.svg?noavatar=true)](https://discordbots.org/bot/266624760782258186)

## Development Requirements

-   [`Node.js`]: To run the project.
-   [`PostgreSQL`]: (Dev Optional) To store persistent data.
-   [`Lavalink`]: (Dev Optional) Audio server.

## Set-Up

Copy and paste the [`config.example.ts`] file in the `src` directory and rename it to `config.ts`, then fill it with the precise variables.
Once all development requirements are set up:

```bash
# Lints and format all the code:
$ yarn lint

# Run Skyra in development mode:
$ yarn start

# Run Skyra in production mode, requires
# Lavalink and PostgreSQL to be running:
$ yarn pm2:start
```

> **Note**: Before pushing to the repository, please run `yarn lint` so formatting stays consistent and there are no linter warnings.

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

[`node.js`]:            https://nodejs.org/en/download/current/
[`postgresql`]:         https://www.postgresql.org/download/
[`lavalink`]:           https://github.com/Frederikam/Lavalink

[`config.example.ts`]:  /src/config.example.ts

[skyra invite link]:    https://skyra.pw/invite
[support server]:       https://join.skyra.pw
[patreon]:              https://www.patreon.com/kyranet

[klasa's website]:      https://klasa.js.org

[patreonimage]:         https://raw.githubusercontent.com/skyra-project/Skyra/master/assets/github/patreon.png
[paypalimage]:          https://raw.githubusercontent.com/skyra-project/Skyra/master/assets/github/paypal.png
[bitcoinimage]:         https://raw.githubusercontent.com/skyra-project/Skyra/master/assets/github/bitcoin.png
[ethereumimage]:        https://raw.githubusercontent.com/skyra-project/Skyra/master/assets/github/ethereum.png
[litecoinimage]:        https://raw.githubusercontent.com/skyra-project/Skyra/master/assets/github/litecoin.png
