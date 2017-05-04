function progress(prog) {
  let l = 0;
  if (prog.act1) l++;
  if (prog.act2) l++;
  if (prog.act3) l++;
  if (prog.act4) l++;
  if (prog.act5) l++;
  return l;
}

exports.run = async (client, msg, [server, user]) => {
  const cfg = client.constants.config;

  const url = `https://${server}.api.battle.net/d3/profile/${encodeURIComponent(user.replace(/#/gi, "-"))}/?locale=en_US&apikey=${cfg.bliztoken}`;
  try {
    msg.channel.startTyping();
    const res = await client.wrappers.requestJSON(url);
    if (res.code === "NOTFOUND") throw new Error(client.constants.httpResponses(404));
    const embed = new client.methods.Embed()
      .setTitle(`**Diablo 3 Stats:** *${res.battleTag}*`)
      .setColor(0xEF8400)
      .setDescription(client.indents`
        Paragon level: **${res.paragonLevel}**
        Killed: ${res.kills.monsters ? `**${res.kills.monsters}** monsters${res.kills.elites ? ` and **${res.kills.elites}** elites.` : "."}` : "zero."}${res.fallenHeroes === undefined ? `\n${res.fallenHeroes.join(", ")}` : ""}
        Progression: Act **${progress(res.progression)}**.
        \u200B
        `)
      .setFooter("📊 Statistics")
      .setThumbnail("https://upload.wikimedia.org/wikipedia/en/8/80/Diablo_III_cover.png")
      .setTimestamp();
    for (let i = 0; i < 4; i++) {
      if (res.heroes[i]) {
        embed.addField(`❯ ${res.heroes[i].name} ${res.heroes[i].gender ? "♀" : "♂"}`, client.indents`
        \u200B  Class: **${res.heroes[i].class}**
        \u200B  Level: **${res.heroes[i].level}**
        \u200B  Elite kills: **${res.heroes[i].kills.elites}**
        \u200B  ${res.heroes[i].hardcore ? `Hardcore${res.heroes[i].dead ? ", dead." : "."}` : ""}
        `, true);
      }
    }
    await msg.sendEmbed(embed);
  } catch (e) {
    msg.error(e);
  } finally {
    msg.channel.stopTyping(true);
  }
  return true;
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
