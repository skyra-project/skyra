/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [channel = msg.channel, ...content]) => {
  /* Attachments */
  const attachment = msg.attachments.first() ? msg.attachments.first().url : null;

  /* Content */
  content = content.length ? content.join(" ") : undefined;

  /* Check if the message is valid */
  if (!content && !attachment) throw client.constants.httpResponses(403);

  const options = {};
  if (attachment) Object.assign(options, { files: [{ attachment }] });

  await channel.send(content, options);
  if (channel !== msg.channel) await msg.alert(`Message successfully sent to ${channel}`);
  await msg.nuke(5000);
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
