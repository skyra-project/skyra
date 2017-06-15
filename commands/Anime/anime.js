const { fromString } = require("html-to-text");
const constants = require("../../utils/constants");

/* Autentification */
const { user, password } = constants.getConfig.tokens.animelist;
const Authorization = constants.basicAuth(user, password);

const etype = {
  TV: "📺 TV",
  MOVIE: "🎥 Movie",
  OVA: "📼 Original Video Animation",
  SPECIAL: "🎴 Special",
};

exports.run = async (client, msg, [args]) => {
  const url = `https://myanimelist.net/api/anime/search.xml?q=${encodeURIComponent(args.toLowerCase())}`;
  const data = await client.funcs.fetch.XML(url, { headers: { Authorization } });
  const fres = data.anime.entry[0];
  const context = fromString(fres.synopsis.toString());
  const score = Math.ceil(parseFloat(fres.score));
  const embed = new client.methods.Embed()
    .setColor(constants.oneToTen(score).color)
    .setAuthor(`${fres.title} (${fres.episodes === 0 ? "unknown" : fres.episodes} eps)`, `${fres.image || msg.author.displayAvatarURL}`)
    .setDescription([
      `**English title:** ${fres.english}\n`,
      `${context.length > 750 ? `${client.funcs.splitText(context, 750)}... [continue reading](https://myanimelist.net/anime/${fres.id})` : context}`,
    ].join("\n"))
    .addField("Type", etype[fres.type.toString().toUpperCase()] || fres.type, true)
    .addField("Score", `**${fres.score}** / 10 ${constants.oneToTen(score).emoji}\u200B`, true)
    .addField("Status", [
      `\u200B  ❯  Current status: **${fres.status}**`,
      `\u200B    • Started: **${fres.start_date}**\n${fres.end_date === "0000-00-00" ? "" : `\u200B    • Finished: **${fres.end_date}**`}`,
    ].join("\n"))
    .addField("Watch it here:", `**[https://myanimelist.net/anime/${fres.id}](https://myanimelist.net/anime/${fres.id})**\u200B`)
    .setFooter("© MyAnimeList");
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
  cooldown: 10,
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
