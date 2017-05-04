const realmsID = {
  us: 1,
  eu: 2,
  kr: 3,
  tw: 4,
};

const realms = {
  1: "North America",
  2: "Europe",
  3: "Korea",
  4: "South-East Asia",
};

exports.run = async (client, msg, [server, name, id]) => {
  const cfg = client.constants.config;

  server = realmsID[server.toLowerCase()];
  const url = `https://us.api.battle.net/sc2/profile/${id}/${server}/${encodeURIComponent(name)}/?locale=en_US&apikey=${cfg.bliztoken}`;
  msg.channel.startTyping();
  try {
    const res = await client.wrappers.requestJSON(url);
    if (res.code !== 200) throw new Error(client.constants.httpResponses(res.code));
    const embed = new client.methods.Embed()
      .setTitle(`StarCraft 2 Stats: ${res.displayName} (${res.id})`)
      .setColor(0x0B947F)
      .setDescription("\u200B")
      .addField(`❯ ${res.displayName}`, client.indents`
        Season total games: **${res.career.seasonTotalGames}**.
        Career total games: **${res.career.careerTotalGames}**.

        Clan: **${res.clanName === "" ? "none" : `${res.clanName} (tag: ${res.clanTag})`}**.
        Realm: **${realms[res.realm]}**

        Season: **${res.season.seasonId}** (Year **${res.season.seasonYear}**, **${res.season.seasonNumber}**).${res.season.totalGamesThisSeason === 0 ? "" : `\n\u200B    Total games this season: **${res.season.totalGamesThisSeason}**`}

        **[Full profile](http://us.battle.net/sc2/en${res.profilePath})**
        \u200B
        `, true)
      .addField("❯ Career statistics", client.indents`
        Primary race: **${res.career.primaryRace}**.
          Zerg wins: **${res.career.zergWins}**.
          Terran wins: **${res.career.terranWins}**.
          Protoss wins: **${res.career.protossWins}**.
        \u200B
        `, true)
      .addField(`Total achievement points: ${res.achievements.points.totalPoints}.`, "\u200B")
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
