const moment = require("moment");

/* eslint-disable global-require */
exports.run = async (client, msg) => {
  const embed = new client.methods.Embed()
    .setColor(msg.color)
    .setDescription(`📝 **${client.user.username} Statistics**`)
    .addField("❯ Uptime", [
      `• Host: ${moment.duration(require("os").uptime() * 1000).format("d[ days], h[:]mm[:]ss")}`,
      `• Total: ${moment.duration(process.uptime() * 1000).format("d[ days], h[:]mm[:]ss")}`,
      `• Client: ${moment.duration(client.uptime).format("d[ days], h[:]mm[:]ss")}`,
      "\u200B",
    ].join("\n"), true)
    .addField("❯ General Stats", [
      `• Guilds: ${client.guilds.size}`,
      `• Channels: ${client.channels.size}`,
      `• Users: ${client.guilds.map(guild => guild.memberCount).reduce((a, b) => a + b)}`,
      "\u200B",
    ].join("\n"), true)
    .addField("❯ Versions", [
      `• NodeJS: ${process.version}`,
      `• DiscordJS: v${require("discord.js").version}`,
      `• ${client.user.username}: ${client.version}`,
      "\u200B",
    ].join("\n"), true)
    .addField("❯ Host usage", [
      `• CPU Load: ${Math.round(require("os").loadavg()[0] * 10000) / 100}%`,
      `• RAM +Node: ${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`,
      `• RAM Usage: ${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`,
      "\u200B",
    ].join("\n"), true)
    .setTimestamp()
    .setThumbnail(client.user.displayAvatarURL);
  msg.sendEmbed(embed).catch(e => msg.error(e));
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: ["info"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "sts",
  description: "Check Skyra's monitor status.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
