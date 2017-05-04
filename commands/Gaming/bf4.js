const moment = require("moment");

const DateToTime = str => `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`;

exports.run = async (client, msg, [platform, name]) => {
  const url = `http://api.bf4stats.com/api/playerInfo?plat=${platform}&name=${encodeURIComponent(name)}&output=json`;
  try {
    msg.channel.startTyping();
    const res = await client.wrappers.requestJSON(url);
    const embed = new client.methods.Embed()
      .setColor(0x04ABA1)
      .setThumbnail("http://battlefield-clans.com/images/bf4_vertical.png")
      .setTitle(`Battlefield 4 Stats: ${res.player.name}`)
      .setDescription("\u200B")
      .addField("PROFILE", client.indents`
        Rank: **${res.player.rank.nr}** (${res.player.rank.name}).${!res.player.rank.next ? "" : `
            Next: **${res.player.rank.next.nr}** (${res.player.rank.next.name}) in **${(res.player.rank.next.needed - res.player.rank.needed) - (res.player.rank.next.curr - res.player.rank.needed)}**xp (**${res.player.rank.next.relProg.toFixed(0)}%**).\n`}
        Last connection: ${moment.utc(new Date(DateToTime(res.player.lastDay))).format("YYYY/MM/DD")}.
        Last update: ${moment.utc(res.player.dateUpdate).format("YYYY/MM/DD [at] hh:mm:ss")}.

        **[Full profile](${res.player.blPlayer})**
        \u200B
      `)
      .addField("GENERAL STATISTICS", client.indents`
        Time played: **${moment.duration(res.player.timePlayed * 1000).format("DD [**days,**] hh [**hours,**] mm [**mins,**] ss [**secs]")}.
        Kills: **${res.stats.kills}**, deaths: **${res.stats.deaths}** and **${res.stats.killAssists}** assistances (**${(res.stats.kills / res.stats.deaths).toFixed(2)}** K/D).

        Headshots: **${res.stats.headshots}**. In which, the longest was **${res.stats.longestHeadshot}**m.
        Shots fired: **${res.stats.shotsFired}**, in which **${res.stats.shotsHit}** hit (**${((res.stats.shotsHit / res.stats.shotsFired) * 100).toFixed(2)}**% accuracy).
        Played **${res.stats.numRounds}** rounds, won **${res.stats.numWins}** and lost **${res.stats.numLosses}** (**${(res.stats.numWins / res.stats.numLosses).toFixed(2)}** W/L).
        \u200B
      `)
      .addField("OTHER", client.indents`
        **ASSAULT**
          Time: **${moment.duration(res.stats.kits.assault.time * 1000).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}.
          Score: **${res.stats.kits.assault.score}**
          Stars: **${res.stats.kits.assault.stars}**

        **ENGINEER**
          Time: **${moment.duration(res.stats.kits.engineer.time * 1000).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}.
          Score: **${res.stats.kits.engineer.score}**
          Stars: **${res.stats.kits.engineer.stars}**
      `, true)
      .addField("\u200B", client.indents`
        **SUPPORT**
          Healed **${res.stats.heals}**, revived **${res.stats.revives}**.
          Time: **${moment.duration(res.stats.kits.support.time * 1000).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}.
          Score: **${res.stats.kits.support.score}**
          Stars: **${res.stats.kits.support.stars}**

        **RECON**
          Time: **${moment.duration(res.stats.kits.recon.time * 1000).format("DD[**d,**] hh[**h,**] mm[**m,**] ss[**s]")}.
          Score: **${res.stats.kits.recon.score}**
          Stars: **${res.stats.kits.recon.stars}**
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
