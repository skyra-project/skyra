const htmlToText = require("html-to-text");

const etype = {
  TV: "📺 TV",
  MOVIE: "🎥 Movie",
  OVA: "📼 Original Video Animation",
  SPECIAL: "🎴 Special",
};

exports.run = async (client, msg, [args]) => {
  const constants = client.constants;
  /* Autentification */
  const cfg = constants.config;
  const auth = constants.basicAuth(cfg.aluser, cfg.alpass);

  /* URI Query */
  const requestUrl = `https://myanimelist.net/api/anime/search.xml?q=${encodeURIComponent(args.toLowerCase())}`;
  try {
    const result = await client.wrappers.requestXML({ url: requestUrl, headers: { Authorization: auth } }).catch(() => { throw new Error(client.constants.httpResponses(404)); });
    const fres = result.anime.entry[0];
    const context = htmlToText.fromString(fres.synopsis.toString());
    const score = Math.ceil(parseFloat(fres.score));
    const embed = new client.methods.Embed()
      .setColor(constants.oneToTen(score).color)
      .setAuthor(`${fres.title} (${fres.episodes === 0 ? "unknown" : fres.episodes} eps)`, `${fres.image || msg.author.displayAvatarURL}`)
      .setDescription([`**English title:** ${fres.english}`,
        "",
        `${context.length > 1000 ? `${client.funcs.splitText(context, 1000)}... [continue reading](https://myanimelist.net/anime/${fres.id})` : context}`,
      ].join("\n"))
      .addField("Type", etype[fres.type.toString().toUpperCase()] || fres.type, true)
      .addField("Score", `**${fres.score}** / 10 ${constants.oneToTen(score).emoji}\u200B`, true)
      .addField("Status", [`\u200B  ❯  Current status: **${fres.status}**`,
        `\u200B    • Started: **${fres.start_date}**\n${fres.end_date === "0000-00-00" ? "" : `\u200B    • Finished: **${fres.end_date}**`}`].join("\n"))
      .addField("Watch it here:", `**[https://myanimelist.net/anime/${fres.id}](https://myanimelist.net/anime/${fres.id})**\u200B`)
      .setFooter("© MyAnimeList");
    await msg.sendEmbed(embed);
  } catch (e) {
    msg.error(e);
  }
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
};

exports.help = {
  name: "anime",
  description: "Search your favourite anime by title with this command.",
  usage: "<Anime:str>",
  usageDelim: "",
  extendedHelp: [
    "Hey! Do you want to check the info of an Anime?",
    "",
    "Usage:",
    "&anime <Anime>",
    "",
    "Usage",
    " ❯ Anime: name of chosen anime",
    "",
    "Examples:",
    "&anime Space Dandy",
  ].join("\n"),
};
