/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [channel = msg.channel, ...content]) => {
  try {
    /* Attachments */
    let attachment;
    if (!msg.attachments.first()) attachment = null;
    else attachment = msg.attachments.first().url;

    /* Content */
    content = content.length ? content.join(" ") : undefined;

    /* Check if the message is valid */
    if (!content && !attachment) throw client.constants.httpResponses(403);

    await channel.send(content, { file: attachment });
    if (channel !== msg.channel) await msg.alert(`Message successfully sent to ${channel}`);
    await msg.nuke(5000);
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["echo"],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "talk",
  description: "Make Skyra talk in another channel.",
  usage: "[channel:channel] [message:str] [...]",
  usageDelim: " ",
  extendedHelp: "",
};
