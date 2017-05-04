const fsp = require("fs-extra-promise");
const { sep } = require("path");
const moment = require("moment");

exports.send = async (client, msg, channel, sendname, filename) => {
  const dir = `${client.clientBaseDir}tracks${sep}`;
  const file = dir + filename;
  await this.exist(client, filename);

  clearInterval(channel.trackInterval);
  delete channel.tracking;
  delete channel.tracker;
  delete channel.trackertimer;
  delete channel.trackInterval;

  await msg.author.sendFile(file, sendname, `Understood, there's your file for ${channel}.`);
  await fsp.unlinkAsync(file);

  return true;
};

exports.exist = async (client, filename) => {
  const dir = `${client.clientBaseDir}tracks${sep}`;
  const files = await fsp.readdirAsync(dir).catch(() => fsp.ensureDirAsync(dir));
  if (files.includes(filename)) return true;
  throw new Error("File not found.");
};

exports.write = async (client, filename) => {
  const dir = `${client.clientBaseDir}tracks${sep}`;
  const file = dir + filename;
  await fsp.readdirAsync(dir).catch(() => fsp.ensureDirAsync(dir));
  await fsp.appendFileAsync(file, `[${moment.utc(new Date().getTime()).format("HH:mm:ss")}] Starting...\r\n\r\n`);
};

exports.run = async (client, msg, [channel = msg.channel]) => {
  try {
    channel = await client.search.Channel(channel, this.guild);

    if (!channel.tracking) {
        /* Apply properties to Channel */
      channel.tracking = true;
      channel.tracker = msg.author.id;
      channel.trackertimer = msg.createdTimestamp;

      msg.author.send([
        `Ok, I'll track ${channel} for you. Use \`&track\` again to stop it.`,
        "Otherwise, I'll stop tracking after 15 minutes.",
        "When the tracker stops, I'll send a `.txt` file here.",
      ].join("\n"));

      const filename = `${channel.tracker}-${channel.id}-${channel.trackertimer}.txt`;
      this.write(client, filename);

      channel.trackInterval = setInterval(async () => {
        if (new Date().getTime() > channel.trackertimer + 900000) {
          const sendname = `${msg.author.username}-#${channel.name}.txt`;
          await this.send(client, msg, channel, sendname, filename);
        }
      }, 5000);
    } else if (msg.author.id === channel.tracker) {
      const filename = `${channel.tracker}-${channel.id}-${channel.trackertimer}.txt`;
      const sendname = `${msg.author.username}-#${channel.name}.txt`;
      await this.send(client, msg, channel, sendname, filename);
    } else {
      throw new Error(`I'm sorry, but this channel is being tracked by ${msg.guild.members.get(channel.tracker).user.username}`);
    }
  } catch (e) {
    msg.error(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 3,
  botPerms: [],
  requiredFuncs: [],
};

exports.help = {
  name: "track",
  description: "Get EVERY SINGLE MESSAGE from a channel that are sent within 15 minutes or until you stop it.",
  usage: "[channel:channel]",
  usageDelim: "",
};
