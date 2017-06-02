const { JSON: fetchJSON } = require("../../utils/kyraFetch");
const constants = require("../../utils/constants");
const googl = require("goo.gl");

const { google } = constants.getConfig.tokens;

exports.run = async (client, msg, [url]) => {
  googl.setKey(google);
  const embed = new client.methods.Embed().setColor(msg.color).setTimestamp();
  if (!url.startsWith("https://goo.gl/")) {
    const shortUrl = await googl.shorten(url);
    embed.setDescription(`**Shortened URL: [${shortUrl}](${shortUrl})**`);
    await msg.sendEmbed(embed);
  } else {
    const { data } = await fetchJSON(`https://www.googleapis.com/urlshortener/v1/url?key=${google}&shortUrl=${url}`);
    embed.setDescription(`**Expanded URL: [${data.longUrl}](${data.longUrl})**`);
    await msg.sendEmbed(embed);
  }
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
