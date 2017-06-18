const constants = require("../../utils/constants");
const snekfetch = require("snekfetch");

const key = constants.getConfig.tokens.google;

exports.run = async (client, msg, [url]) => {
  const embed = new client.methods.Embed().setColor(msg.color).setTimestamp();
  if (!url.startsWith("https://goo.gl/")) {
    const { id } = await snekfetch.post(`https://www.googleapis.com/urlshortener/v1/url?key=${key}`).send({ longUrl: url }).then(d => JSON.parse(d.text));
    embed.setDescription(`**Shortened URL: [${id}](${id})**`);
  } else {
    const { longUrl } = await snekfetch.get(`https://www.googleapis.com/urlshortener/v1/url?key=${key}&shortUrl=${url}`).then(d => JSON.parse(d.text));
    embed.setDescription(`**Expanded URL: [${longUrl}](${longUrl})**`);
  }
  return msg.send({ embed });
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["shortenurl", "googleshorturl", "shorten"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 30,
};

exports.help = {
  name: "googl",
  description: "Short your links with this tool.",
  usage: "<URL:url>",
  usageDelim: "",
  extendedHelp: [
    "Hey! Do you want me to shorten a link?",
    "",
    "Usage:",
    "&shorten <Link>",
    "",
    " ❯ Link: the URL you want shortened",
    "",
    "Examples:",
    "&shorten youtube.com/watch?v=-QB7pw2wCiU",
    "❯❯ \" Shortened URL: goo.gl/ougrBr \"",
  ].join("\n"),
};
