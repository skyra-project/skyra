const googl = require("goo.gl");

exports.run = async (client, msg, [url]) => {
  googl.setKey(client.constants.config.GoogleAPIKey);
  if (!url.startsWith("https://goo.gl/")) {
    const shortUrl = await googl.shorten(url);
    await msg.send({ embed: { description: `**Shortened URL: [${shortUrl}](${shortUrl})**`, color: msg.color } });
  } else {
    const longUrl = await googl.expand(url);
    await msg.send({ embed: { description: `**Expanded URL: [${longUrl}](${longUrl})**`, color: msg.color } });
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["shortenurl", "googleshorturl", "googl"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 30,
};

exports.help = {
  name: "shorten",
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
