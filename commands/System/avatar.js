/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [avatar]) => {
  if (!avatar) {
    if (!msg.attachments.first()) throw "You have to specify an URL or upload an image";
    avatar = msg.attachments.first().url;
  }

  await client.user.setAvatar(avatar);
  return msg.alert(`Dear ${msg.author}, I have changed my avatar for you.`);
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "avatar",
  description: "Set's the bot's avatar.",
  usage: "[url:url]",
  usageDelim: "",
  extendedHelp: "",
};
