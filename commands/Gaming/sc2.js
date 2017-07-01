const snekfetch = require("snekfetch");
const { getConfig } = require("../../utils/constants");

/* Autentification */
const { blizzard } = getConfig.tokens;

const realmsID = { us: 1, eu: 2, kr: 3, tw: 4 };

const realms = {
    1: "North America",
    2: "Europe",
    3: "Korea",
    4: "South-East Asia",
};

exports.run = async (client, msg, [server, name, id]) => {
    await msg.send("`Fetching data...`");
    server = realmsID[server.toLowerCase()];
    const data = await snekfetch.get(`https://us.api.battle.net/sc2/profile/${id}/${server}/${encodeURIComponent(name)}/?locale=en_US&apikey=${blizzard}`).then(d => JSON.parse(d.text));
    const embed = new client.methods.Embed()
        .setTitle(`StarCraft 2 Stats: ${data.displayName} (${data.id})`)
        .setColor(0x0B947F)
        .setDescription("\u200B")
        .addField(`❯ ${data.displayName}`,
            `Season total games: **${data.career.seasonTotalGames}**.\n` +
            `Career total games: **${data.career.careerTotalGames}**.\n\n` +
            `Clan: **${data.clanName === "" ? "none" : `${data.clanName} (tag: ${data.clanTag})`}**\n` +
            `Realm: **${realms[data.realm]}**\n\n` +
            `Season: **${data.season.seasonId}** (Year **${data.season.seasonYear}**, **${data.season.seasonNumber}**).${data.season.totalGamesThisSeason === 0 ? "" : `    Total games this season: **${data.season.totalGamesThisSeason}**`}\n\n` +
            `**[Full profile](http://us.battle.net/sc2/en${data.profilePath})**\n`
        , true)
        .addField("❯ Career statistics",
            `Primary race: **${data.career.primaryRace}**\n` +
            `  Zerg wins: **${data.career.zergWins}**\n` +
            `  Terran wins: **${data.career.terranWins}**\n` +
            `  Protoss wins: **${data.career.protossWins}**\n`
        , true)
        .addField(`Total achievement points: ${data.achievements.points.totalPoints}.`, "\u200B")
        .setFooter("📊 Statistics")
        .setThumbnail("http://tecnoslave.com/wp-content/uploads/2012/08/Starcraft-II-logo.png")
        .setTimestamp();
    return msg.send({ embed });
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: ["starcraft2"],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 1,
    cooldown: 30,
};

exports.help = {
    name: "sc2",
    description: "Check your stats on StarCraft2.",
    usage: "<us|eu|kr|tw> <username:string> <id:string{7,7}>",
    usageDelim: " ",
    extendedHelp: [
        "Commander! Do you want to check your stats on StarCraft2?",
        "",
        "Usage:",
        "&sc2 <server> <username> <id>",
        "",
        " ❯ Server: choose between us, eu, kr or tw.",
        " ❯ Username: write your username.",
        " ❯ ID: the ID is usually 7 digits long.",
        "",
        "Examples:",
        "&sc2 eu kyra 1642014",
        "❯❯ I show you a lot of stuff from your account. (The example is random)",
    ].join("\n"),
};
