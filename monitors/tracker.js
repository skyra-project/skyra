const fs = require("fs-nextra");
const { sep } = require("path");
const moment = require("moment");

exports.conf = {
  enabled: true,
};

exports.run = async (client, msg) => {
  if (!msg.guild || !msg.channel.tracking) return;
  const filename = `${msg.channel.tracker}-${msg.channel.id}-${msg.channel.trackertimer}.txt`;

  const dir = `${client.clientBaseDir}tracks${sep}`;
  const file = dir + filename;

  const time = `[${moment.utc(msg.createdAt).format("HH:mm:ss")}]`;
  const user = `(${msg.author.id}) ${msg.author.username}`;
  let files;
  if (msg.attachments.first()) files = `\r\nAttachment: ${msg.attachments.map(att => att.url)}`;
  else files = "";
  fs.appendFile(file, `${time} ${user} ❯ \r\n${msg.cleanContent.replace(/\u000A/gi, "\r\n")}${files}\r\n\r\n`)
    .catch(e => client.emit("log", e, "error"));
};
