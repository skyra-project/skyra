const { getConfig, httpResponses } = require("../../utils/constants");
const snekfetch = require("snekfetch");

/* Autentification */
const { blizzard } = getConfig.tokens;

const progress = (prog) => {
    if (prog.act5) return 5;
    if (prog.act4) return 4;
    if (prog.act3) return 3;
    if (prog.act2) return 2;
    if (prog.act1) return 1;
    return 0;
};

const fetchURL = (server, user) => snekfetch.get(`https://${server}.api.battle.net/d3/profile/${user}/?locale=en_US&apikey=${blizzard}`).then(d => JSON.parse(d.text));

exports.run = async (client, msg, [server, user]) => {
    await msg.send("`Fetching data...`");
    const data = await fetchURL(server, encodeURIComponent(user.replace(/#/gi, "-")));
    if (data.code === "NOTFOUND") throw httpResponses(404);
    const embed = new client.methods.Embed()
        .setTitle(`**Diablo 3 Stats:** *${data.battleTag}*`)
        .setColor(0xEF8400)
        .setDescription(
            `Paragon level: **${data.paragonLevel}**\n` +
            `Killed: ${data.kills.monsters ? `**${data.kills.monsters}** monsters${data.kills.elites ? ` and **${data.kills.elites}** elites.` : "."}` : "zero."}${data.fallenHeroes === undefined ? `\n${data.fallenHeroes.join(", ")}` : ""}\n` +
            `Progression: Act **${progress(data.progression)}**.\n`,
        )
        .setFooter("📊 Statistics")
        .setThumbnail("https://upload.wikimedia.org/wikipedia/en/8/80/Diablo_III_cover.png")
        .setTimestamp();

    for (let i = 0; i < 4; i++) {
        if (!data.heroes[i]) break;
        embed.addField(`❯ ${data.heroes[i].name} ${data.heroes[i].gender ? "♀" : "♂"}\n` +
            `  Class: **${data.heroes[i].class}**\n` +
            `  Level: **${data.heroes[i].level}**\n` +
            `  Elite kills: **${data.heroes[i].kills.elites}**\n` +
            `  ${data.heroes[i].hardcore ? `Hardcore${data.heroes[i].dead ? ", dead." : "."}` : ""}\n`
        , true);
    }

    return msg.send({ embed });
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: ["diablo3"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 1,
    cooldown: 30,
};

exports.help = {
    name: "d3",
    description: "Check your stats on Diablo3.",
    usage: "<us|eu|kr|tw> <username:string>",
    usageDelim: " ",
    extendedHelp: [
        "Warriors! Do you want to check your stats on Diablo 3?",
        "",
        "Usage:",
        "&d3 <server> <username>",
        "",
        " ❯ Server: choose between us, eu, kr or tw.",
        " ❯ Username: write your username.",
        "",
        "Examples:",
        "&d3 eu kyra",
        "❯❯ I show you a lot of stuff from your account. (The example is random)",
    ].join("\n"),
};
