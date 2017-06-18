const moment = require("moment");

const DateToTime = str => (typeof str === "string" ? `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}` : "00-00-00");

exports.run = async (client, msg, [platform, name]) => {
  await msg.send("`Fetching data...`");
  const data = await client.funcs.fetch.JSON(`http://api.bf4stats.com/api/playerInfo?plat=${platform}&name=${encodeURIComponent(name)}&output=json`);
  const { stats, player } = data;
  const embed = new client.methods.Embed()
    .setColor(0x04ABA1)
    .setThumbnail("http://battlefield-clans.com/images/bf4_vertical.png")
    .setTitle(`Battlefield 4 Stats: ${player.name}`)
    .setDescription("\u200B")
    .addField("PROFILE", [
      `Rank: **${player.rank.nr}** (${player.rank.name}).${!player.rank.next ? "" : `
          Next: **${player.rank.next.nr}** (${player.rank.next.name}) in **${(player.rank.next.needed - player.rank.needed) - (player.rank.next.curr - player.rank.needed)}**xp (**${data.player.rank.next.relProg.toFixed(0)}%**).\n`}`,
      `Last connection: ${moment.utc(new Date(DateToTime(player.lastDay))).format("YYYY/MM/DD")}.`,
      `Last update: ${moment.utc(player.dateUpdate).format("YYYY/MM/DD [at] hh:mm:ss")}.`,
      "",
      `**[Full profile](${player.blPlayer})**`,
      "\u200B",
    ].join("\n"))
    .addField("GENERAL STATISTICS", [
      `Time played: **${moment.duration(player.timePlayed * 1000).format("DD [**days,**] hh [**hours,**] mm [**mins,**] ss [**secs]")}.`,
      `Kills: **${stats.kills}**, deaths: **${stats.deaths}** and **${stats.killAssists}** assistances (**${(stats.kills / stats.deaths).toFixed(2)}** K/D).`,
      "",
      `Headshots: **${stats.headshots}**. In which, the longest was **${stats.longestHeadshot}**m.`,
      `Shots fired: **${stats.shotsFired}**, in which **${stats.shotsHit}** hit (**${((stats.shotsHit / stats.shotsFired) * 100).toFixed(2)}**% accuracy).`,
      `Played **${stats.numRounds}** rounds, won **${stats.numWins}** and lost **${stats.numLosses}** (**${(stats.numWins / stats.numLosses).toFixed(2)}** W/L).`,
      "\u200B",
    ].join("\n"))
    .addField("OTHER", [
      "**ASSAULT**",
      `  Time: **${moment.duration(stats.kits.assault.time * 1000).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}.`,
      `  Score: **${stats.kits.assault.score}**`,
      `  Stars: **${stats.kits.assault.stars}**`,
      "",
      "**ENGINEER**",
      `  Time: **${moment.duration(stats.kits.engineer.time * 1000).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}.`,
      `  Score: **${stats.kits.engineer.score}**`,
      `  Stars: **${stats.kits.engineer.stars}**`,
    ].join("\n"), true)
    .addField("\u200B", [
      "**SUPPORT**",
      `  Healed **${stats.heals}**, revived **${stats.revives}**.`,
      `  Time: **${moment.duration(stats.kits.support.time * 1000).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}.`,
      `  Score: **${stats.kits.support.score}**`,
      `  Stars: **${stats.kits.support.stars}**`,
      "",
      "**RECON**",
      `  Time: **${moment.duration(stats.kits.recon.time * 1000).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}.`,
      `  Score: **${stats.kits.recon.score}**`,
      `  Stars: **${stats.kits.recon.stars}**`,
    ].join("\n"), true)
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
