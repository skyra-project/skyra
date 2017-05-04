exports.run = async (client, msg, [user, ...content]) => {
  let attachment;
  if (!msg.attachments.first()) attachment = null;
  else attachment = msg.attachments.first().url;

  try {
    await user.send(content.join(" "), { file: attachment });
    await msg.alert(`Message successfully sent to ${user}`);
    await msg.nuke(5000);
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["pm"],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "dm",
  description: "Make Skyra send a DM to an user.",
  usage: "<user:user> <message:str> [...]",
  usageDelim: " ",
  extendedHelp: "",
};
