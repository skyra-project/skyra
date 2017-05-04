exports.run = async (client, msg, [nick = ""]) => {
  const text = nick.length ? `Nickname changed to **${nick}**` : "Nickname Cleared";

  try {
    await msg.guild.member(client.user).setNickname(nick);
    await msg.alert(text);
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 3,
  botPerms: ["CHANGE_NICKNAME"],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "nick",
  description: "Set's the bot's nickname",
  usage: "[nick:str{,32}]",
  usageDelim: "",
  extendedHelp: "",
};
