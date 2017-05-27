/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [emoji]) => {
  if (!/^<:\w{2,32}:\d{17,21}>$/.test(emoji)) throw "You must insert a valid emoji";
  const defractured = /^<:(\w{2,32}):(\d{17,21})>$/.exec(emoji);
  const emojiName = defractured[1];
  const emojiID = defractured[2];
  const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;

  await msg.send([
    `Emoji: **${emojiName}**`,
    `ID: **${emojiID}**`,
    `Guild: ${client.emojis.has(emojiID) ? this.resolveGuild(client.emojis.get(emojiID).guild) : "Unknown."}`,
  ].join("\n"), { files: [{ attachment: emojiURL }] });
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
