/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [emoji]) => {
  try {
    if (!/^<:\w{2,32}:\d{17,18}>$/.test(emoji)) throw "You must insert a valid emoji";
    const defractured = /^<:(\w{2,32}):(\d{17,18})>$/.exec(emoji);
    const emojiName = defractured[1];
    const emojiID = defractured[2];
    const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;

    msg.send([
      `Emoji: **${emojiName}**`,
      `ID: **${emojiID}**`,
      `Guild: ${client.emojis.has(emojiID) ? this.resolveGuild(client.emojis.get(emojiID).guild) : "Not found."}`,
    ].join("\n"), { files: [{ attachment: emojiURL }] });
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
