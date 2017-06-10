const managerMusic = require("../../utils/managerMusic");
const moment = require("moment");

exports.run = async (client, msg) => {
  try {
    managerMusic.requiredVC(client, msg);
    const queue = managerMusic.get(msg.guild.id);
    const output = [];
    queue.songs.forEach(song => output.push([
      `**TITLE**: ${song.title}`,
      `**URL**: <${song.url}> (${moment.duration(song.seconds * 1000).format("h[:]mm[:]ss")})`,
      `**REQUESTER**: ${song.requester.tag || song.requester}`,
    ].join("\n")));
    if (queue.autoPlay) output.push(`\n**AutoPlay**: <${queue.next}>`);
    return msg.send(output.join(`\n\\🎵${"―".repeat(10)}\\🎵\n`));
  } catch (e) {
    return msg.send(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 10,
  guilds: managerMusic.guilds,
};

exports.help = {
  name: "queue",
  description: "Displays the music queue.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
