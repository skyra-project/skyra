const snekfetch = require("snekfetch");
const moment = require("moment");

const DateToTime = str => (typeof str === "string" ? `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}` : "00-00-00");
const durationFormat = number => `**${moment.duration(number).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}`;
const fetchURL = url => snekfetch.get(url).then(d => JSON.parse(d.text));

exports.run = async (client, msg, [platform, name]) => {
    await msg.send("`Fetching data...`");
    const data = await fetchURL(`http://api.bf4stats.com/api/playerInfo?plat=${platform}&name=${encodeURIComponent(name)}&output=json`);
    const { stats, player } = data;
    const embed = new client.methods.Embed()
        .setColor(0x04ABA1)
        .setThumbnail("http://battlefield-clans.com/images/bf4_vertical.png")
        .setTitle(`Battlefield 4 Stats: ${player.name}`)
        .setDescription("\u200B")
        .addField("PROFILE",
            `Rank: **${player.rank.nr}** (${player.rank.name}).${!player.rank.next ? "" : `
                Next: **${player.rank.next.nr}** (${player.rank.next.name}) in **${(player.rank.next.needed - player.rank.needed) - (player.rank.next.curr - player.rank.needed)}**xp (**${data.player.rank.next.relProg.toFixed(0)}%**).\n`}\n` +
            `Last connection: ${moment.utc(new Date(DateToTime(player.lastDay))).format("YYYY/MM/DD")}.\n` +
            `Last update: ${moment.utc(player.dateUpdate).format("YYYY/MM/DD [at] hh:mm:ss")}.\n\n` +
            `**[Full profile](${player.blPlayer})**`,
        )
        .addField("GENERAL STATISTICS",
            `Time played: ${durationFormat(player.timePlayed * 1000)}.\n` +
            `Kills: **${stats.kills}**, deaths: **${stats.deaths}** and **${stats.killAssists}** assistances (**${(stats.kills / stats.deaths).toFixed(2)}** K/D).\n` +
            `Headshots: **${stats.headshots}**. In which, the longest was **${stats.longestHeadshot}**m.\n` +
            `Shots fired: **${stats.shotsFired}**, in which **${stats.shotsHit}** hit (**${((stats.shotsHit / stats.shotsFired) * 100).toFixed(2)}**% accuracy).\n` +
            `Played **${stats.numRounds}** rounds, won **${stats.numWins}** and lost **${stats.numLosses}** (**${(stats.numWins / stats.numLosses).toFixed(2)}** W/L).\n`,
        )
        .addField("OTHER",
            "**ASSAULT**\n" +
            `  Time: ${durationFormat(stats.kits.assault.time * 1000)}.\n` +
            `  Score: **${stats.kits.assault.score}**\n` +
            `  Stars: **${stats.kits.assault.stars}**\n\n` +
            "**ENGINEER**\n" +
            `  Time: ${durationFormat(stats.kits.engineer.time * 1000)}.\n` +
            `  Score: **${stats.kits.engineer.score}**\n` +
            `  Stars: **${stats.kits.engineer.stars}**\n`
        , true)
        .addField("\u200B",
            "**SUPPORT**\n" +
            `  Healed **${stats.heals}**, revived **${stats.revives}**.\n` +
            `  Time: ${durationFormat(stats.kits.support.time * 1000)}.\n` +
            `  Score: **${stats.kits.support.score}**\n` +
            `  Stars: **${stats.kits.support.stars}**\n\n` +
            "**RECON**\n" +
            `  Time: ${durationFormat(stats.kits.recon.time * 1000)}.\n` +
            `  Score: **${stats.kits.recon.score}**\n` +
            `  Stars: **${stats.kits.recon.stars}**\n`
        , true)
        .setFooter("📊 Statistics");

    return msg.send({ embed });
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: ["battlefield4"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 1,
    cooldown: 30,
};

exports.help = {
    name: "bf4",
    description: "Check stats from somebody in Battlefield 4.",
    usage: "<pc|xbox|ps3|xone|ps4> <Username:string>",
    usageDelim: " ",
    extendedHelp: [
        "Soldier! Do you REALLY want to check what you're made of?",
        "",
        "Usage:",
        "&bf4 <platform> <username>",
        "",
        " ❯ Platform: choose between pc, xbox, ps3, xone or ps4",
        " ❯ Username: write your username.",
        "",
        "Examples:",
        "&bf4 pc kyra",
        "❯❯ I show you a lot of stuff from your account.",
    ].join("\n"),
};
