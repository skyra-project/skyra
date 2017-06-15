const snek = require("snekfetch");

/* eslint-disable no-bitwise */
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
    } else if (c >= 0xD800 && c <= 0xDBFF) p = c;
    else r.push(c.toString(16));
  }
  return r.join("-");
};

exports.run = async (client, msg, [emoji]) => {
  if (/^<:\w{2,32}:\d{17,21}>$/.test(emoji)) {
    const defractured = /^<:(\w{2,32}):(\d{17,21})>$/.exec(emoji);
    const emojiName = defractured[1];
    const emojiID = defractured[2];
    const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;

    return msg.send([
      `Emoji: **${emojiName}**`,
      "Type: **Custom**",
      `ID: **${emojiID}**`,
      `Guild: ${client.emojis.has(emojiID) ? this.resolveGuild(client.emojis.get(emojiID).guild) : "Unknown."}`,
    ].join("\n"), { files: [{ attachment: emojiURL }] });
  }
  if (!/^[^a-zA-Z0-9]{1,4}$/.test(emoji)) throw `${emoji} is not a valid emoji.`;
  const r = this.emoji(emoji);

  const emojiURL = `https://twemoji.maxcdn.com/2/72x72/${r}.png`;
  const { body } = await snek.get(emojiURL);

  return msg.send([
    `Emoji: **${emoji}**`,
    "Type: **Twemoji**",
    `ID: **${r}**`,
  ].join("\n"), { files: [{ attachment: body, name: `${r}.png` }] });
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
  name: "emoji",
  description: "Get info from an emoji.",
  usage: "<emoji:str>",
  usageDelim: "",
  extendedHelp: "",
};

exports.resolveGuild = guild => `${guild.name} (${guild.id})`;
