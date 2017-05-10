const snek = require("snekfetch");

/* eslint-disable no-throw-literal, no-bitwise */
exports.emoji = (emoji) => {
  const r = [];
  let c = 0;
  let p = 0;
  let i = 0;

  while (i < emoji.length) {
    c = emoji.charCodeAt(i++);
    if (p) {
      r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
      p = 0;
    } else if (c >= 0xD800 && c <= 0xDBFF) {
      p = c;
    } else {
      r.push(c.toString(16));
    }
  }
  return r.join("-");
};

exports.run = async (client, msg, [emoji]) => {
  if (!/^[^a-zA-Z0-9]{1,4}$/.test(emoji)) throw `${emoji} is not a valid emoji.`;
  const r = this.emoji(emoji);

  const emojiURL = `https://twemoji.maxcdn.com/2/72x72/${r}.png`;
  const data = await snek.get(emojiURL);
  const buffer = data.body;

  msg.send(`Emoji: **${r}**`, { files: [{ attachment: buffer }] });
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 0,
  cooldown: 15,
};

exports.help = {
  name: "twemoji",
  description: "Get info from an emoji.",
  usage: "<emoji:str{1,4}>",
  usageDelim: "",
  extendedHelp: "",
};

exports.resolveGuild = guild => `${guild.name} (${guild.id})`;
