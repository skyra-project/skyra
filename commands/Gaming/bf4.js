const moment = require("moment");

const DateToTime = str => `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`;

exports.run = async (client, msg, [platform, name]) => {
  const url = `http://api.bf4stats.com/api/playerInfo?plat=${platform}&name=${encodeURIComponent(name)}&output=json`;
  try {
    msg.channel.startTyping();
    const { data } = await client.fetch.JSON(url);
    const embed = new client.methods.Embed()
      .setColor(0x04ABA1)
      .setThumbnail("http://battlefield-clans.com/images/bf4_vertical.png")
      .setTitle(`Battlefield 4 Stats: ${data.player.name}`)
      .setDescription("\u200B")
      .addField("PROFILE", client.indents`
        Rank: **${data.player.rank.nr}** (${data.player.rank.name}).${!data.player.rank.next ? "" : `
            Next: **${data.player.rank.next.nr}** (${data.player.rank.next.name}) in **${(data.player.rank.next.needed - data.player.rank.needed) - (data.player.rank.next.curr - data.player.rank.needed)}**xp (**${data.player.rank.next.relProg.toFixed(0)}%**).\n`}
        Last connection: ${moment.utc(new Date(DateToTime(data.player.lastDay))).format("YYYY/MM/DD")}.
        Last update: ${moment.utc(data.player.dateUpdate).format("YYYY/MM/DD [at] hh:mm:ss")}.

        **[Full profile](${data.player.blPlayer})**
        \u200B
      `)
      .addField("GENERAL STATISTICS", client.indents`
        Time played: **${moment.duration(data.player.timePlayed * 1000).format("DD [**days,**] hh [**hours,**] mm [**mins,**] ss [**secs]")}.
        Kills: **${data.stats.kills}**, deaths: **${data.stats.deaths}** and **${data.stats.killAssists}** assistances (**${(data.stats.kills / data.stats.deaths).toFixed(2)}** K/D).

        Headshots: **${data.stats.headshots}**. In which, the longest was **${data.stats.longestHeadshot}**m.
        Shots fired: **${data.stats.shotsFired}**, in which **${data.stats.shotsHit}** hit (**${((data.stats.shotsHit / data.stats.shotsFired) * 100).toFixed(2)}**% accuracy).
        Played **${data.stats.numRounds}** rounds, won **${data.stats.numWins}** and lost **${data.stats.numLosses}** (**${(data.stats.numWins / data.stats.numLosses).toFixed(2)}** W/L).
        \u200B
      `)
      .addField("OTHER", client.indents`
        **ASSAULT**
          Time: **${moment.duration(data.stats.kits.assault.time * 1000).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}.
          Score: **${data.stats.kits.assault.score}**
          Stars: **${data.stats.kits.assault.stars}**

        **ENGINEER**
          Time: **${moment.duration(data.stats.kits.engineer.time * 1000).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}.
          Score: **${data.stats.kits.engineer.score}**
          Stars: **${data.stats.kits.engineer.stars}**
      `, true)
      .addField("\u200B", client.indents`
        **SUPPORT**
          Healed **${data.stats.heals}**, revived **${data.stats.revives}**.
          Time: **${moment.duration(data.stats.kits.support.time * 1000).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}.
          Score: **${data.stats.kits.support.score}**
          Stars: **${data.stats.kits.support.stars}**

        **RECON**
          Time: **${moment.duration(data.stats.kits.recon.time * 1000).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}.
          Score: **${data.stats.kits.recon.score}**
          Stars: **${data.stats.kits.recon.stars}**
      `, true)
      .setFooter("📊 Statistics");
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
