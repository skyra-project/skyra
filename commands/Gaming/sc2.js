const { JSON: fetchJSON } = require("../../utils/kyraFetch");
const constants = require("../../utils/constants");

/* Autentification */
const { blizzard } = constants.getConfig.tokens;

const realmsID = { us: 1, eu: 2, kr: 3, tw: 4 };

const realms = {
  1: "North America",
  2: "Europe",
  3: "Korea",
  4: "South-East Asia",
};

exports.run = async (client, msg, [server, name, id]) => {
  server = realmsID[server.toLowerCase()];
  const url = `https://us.api.battle.net/sc2/profile/${id}/${server}/${encodeURIComponent(name)}/?locale=en_US&apikey=${blizzard}`;
  msg.channel.startTyping();
  try {
    const { data } = await fetchJSON(url);
    if (data.code !== 200) throw new Error(constants.httpResponses(data.code));
    const embed = new client.methods.Embed()
      .setTitle(`StarCraft 2 Stats: ${data.displayName} (${data.id})`)
      .setColor(0x0B947F)
      .setDescription("\u200B")
      .addField(`❯ ${data.displayName}`, [
        `Season total games: **${data.career.seasonTotalGames}**.`,
        `Career total games: **${data.career.careerTotalGames}**.`,
        "",
        `Clan: **${data.clanName === "" ? "none" : `${data.clanName} (tag: ${data.clanTag})`}**.`,
        `Realm: **${realms[data.realm]}**`,
        "",
        `Season: **${data.season.seasonId}** (Year **${data.season.seasonYear}**, **${data.season.seasonNumber}**).${data.season.totalGamesThisSeason === 0 ? "" : `\n\u200B    Total games this season: **${data.season.totalGamesThisSeason}**`}`,
        "",
        `**[Full profile](http://us.battle.net/sc2/en${data.profilePath})**`,
        "\u200B",
      ].join("\n"), true)
      .addField("❯ Career statistics", [
        `Primary race: **${data.career.primaryRace}**.`,
        `  Zerg wins: **${data.career.zergWins}**.`,
        `  Terran wins: **${data.career.terranWins}**.`,
        `  Protoss wins: **${data.career.protossWins}**.`,
        "\u200B",
      ].join("\n"), true)
      .addField(`Total achievement points: ${data.achievements.points.totalPoints}.`, "\u200B")
      .setFooter("📊 Statistics")
      .setThumbnail("http://tecnoslave.com/wp-content/uploads/2012/08/Starcraft-II-logo.png")
      .setTimestamp();
    await msg.sendEmbed(embed);
  } catch (e) {
    msg.error(e);
  } finally {
    msg.channel.stopTyping(true);
  }
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
  usage: "<us|eu|kr|tw> <username:string> <id:str{7,7}>",
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
