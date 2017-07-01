const { getConfig } = require("../../utils/constants");
const snekfetch = require("snekfetch");

/* Autentification */
const { osu, httpResponses } = getConfig.tokens;

const game = {
    STANDARD: 0,
    TAIKO: 1,
    CTB: 2,
    MANIA: 3,
};

const inf = {
    SIGNATURES: 1,
    USERPROFILE: 2,
    BESTPLAYS: 3,
    RECENTPLAYS: 4,
};

const fetchURL = (gamemode, username) => snekfetch.get(`https://osu.ppy.sh/api/get_user?m=${gamemode}&u=${username}&k=${osu}`).then(d => JSON.parse(d.text));

exports.run = async (client, msg, [gamemode, information, ...username]) => {
    gamemode = game[gamemode.toUpperCase()];
    information = inf[information.toUpperCase()];
    username = username[0].split(" ").join("+");

    await msg.send("`Fetching data...`");
    const data = await fetchURL(gamemode, encodeURIComponent(username));
    const uinfo = data[0];
    if (!uinfo) throw httpResponses(404);
    const embed = new client.methods.Embed().setColor(msg.color);
    switch (information) {
        case 1:
            embed
                .setTitle(`Osu! User profile for ${uinfo.username} (${uinfo.user_id})`)
                .setDescription(
                    `[**${uinfo.country}**] Level **${parseInt(uinfo.level)}**\n` +
                    `Rank: **${(uinfo.pp_rank).toLocaleString()}** (Country rank: **${(uinfo.pp_country_rank).toLocaleString()}**)`,
                )
                .addField("❯ Information",
                    `  • Accuracy: **${parseInt(uinfo.accuracy)}**%\n` +
                    `  • Play count: **${(uinfo.playcount).toLocaleString()}**`,
                );
            break;
        case 2:
            embed
                .setTitle(`Osu! User profile for ${uinfo.username} (${uinfo.user_id})`)
                .setDescription(
                    `[**${uinfo.country}**] Level **${parseInt(uinfo.level)}**\n` +
                    `Rank: **${(uinfo.pp_rank).toLocaleString()}** (Country rank: **${(uinfo.pp_country_rank).toLocaleString()}**)`,
                )
                .addField("❯ Scores",
                    `  • Total score: **${(uinfo.total_score).toLocaleString()}**\n` +
                    `  • Ranked score: **${(uinfo.ranked_score).toLocaleString()}**`
                , true)
                .addField("❯ Beatmaps",
                    `  • Play count: **${(uinfo.playcount).toLocaleString()}**\n` +
                    `  • 50s: **${(uinfo.count50).toLocaleString()}**\n` +
                    `  • 100s: **${(uinfo.count100).toLocaleString()}**\n` +
                    `  • 300s: **${(uinfo.count300).toLocaleString()}**`
                , true)
                .addField("❯ Accuracy ranks",
                    `  • Accuracy: **${parseInt(uinfo.accuracy)}**%\n` +
                    `  • Perfect accuracy: **${(uinfo.count_rank_ss).toLocaleString()}**\n` +
                    `  • Nearly perfect accuracy: **${(uinfo.count_rank_s).toLocaleString()}**\n` +
                    `  • Almost perfect accuracy: **${(uinfo.count_rank_a).toLocaleString()}**`,
                );
            break;
        case 3:
            embed
                .setTitle(`Best beatmap by ${uinfo.username} (${uinfo.user_id})`)
                .setDescription(`ID Beatmap: [**${uinfo.beatmap_id}**] Score: **${(uinfo.score)}**\n\u200B`).toLocaleString()
                .addField("❯ Counts",
                    `  • 50s: **${(uinfo.count50).toLocaleString()}**\n` +
                    `  • 100s: **${(uinfo.count100).toLocaleString()}**\n` +
                    `  • 300s: **${(uinfo.count300).toLocaleString()}**\n\n` +
                    `  • **${(uinfo.countmiss).toLocaleString()}** misses.\n` +
                    `  • **${(uinfo.countkatu).toLocaleString()}** katus.\n` +
                    `  • **${(uinfo.countgeki).toLocaleString()}** gekis.\n` +
                    `  • **${uinfo.perfect ? "Maximum combo of map reached." : "Couldn't reach maximum combo of map."}**`
                , true)
                .addField("❯ Info",
                    `  • Date: **${uinfo.date}**\n` +
                    `  • Rank: **${(uinfo.rank).toLocaleString()}**`,
                );
            break;
        case 4:
            embed
                .setTitle(`Best beatmap by ${uinfo.username} (${uinfo.user_id})`)
                .setDescription(`ID Beatmap: [**${uinfo.beatmap_id}**] Score: **${(uinfo.score)}**\n\u200B`).toLocaleString()
                .addField("❯ Counts",
                    `  • 50s: **${(uinfo.count50).toLocaleString()}**\n` +
                    `  • 100s: **${(uinfo.count100).toLocaleString()}**\n` +
                    `  • 300s: **${(uinfo.count300).toLocaleString()}**\n\n` +
                    `  • **${(uinfo.countmiss).toLocaleString()}** misses.\n` +
                    `  • **${(uinfo.countkatu).toLocaleString()}** katus.\n` +
                    `  • **${(uinfo.countgeki).toLocaleString()}** gekis.\n` +
                    `  • **${uinfo.perfect ? "Maximum combo of map reached." : "Couldn't reach maximum combo of map."}**`
                , true)
                .addField("❯ Info",
                    `  • Date: **${uinfo.date}**\n` +
                    `  • Rank: **${(uinfo.rank).toLocaleString()}**`,
                );
            break;
        // no default
    }

    return msg.send({ embed });
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 1,
    cooldown: 30,
};

exports.help = {
    name: "osu",
    description: "Check info from Osu!",
    usage: "<Standard|Taiko|CtB|Mania> <Signatures|UserProfile|BestPlays|RecentPlays> <Username:string> [...]",
    usageDelim: " ",
    extendedHelp: [
        "Let's click hard! Do you want to check your stats on Osu?",
        "",
        "Usage:",
        "&osu <GameMode> <Information> <Username>",
        "",
        " ❯ GameMode: choose the gamemode you want to display info about.",
        " ❯ Information: choose the type of information.",
        " ❯ Username: your username!",
        "",
        "Examples:",
        "&osu standard userprofile kyra",
        "❯❯ I show you a lot of stuff from your account.",
    ].join("\n"),
};
