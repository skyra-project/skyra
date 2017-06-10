const managerMusic = require("../../utils/managerMusic");

exports.run = async (client, msg, [vol = null]) => {
  try {
    this.requiredVC(client, msg);
    const song = managerMusic.get(msg.guild.id).songs[0];
    if (!vol) return msg.send(`📢 Volume: ${Math.round(song.dispatcher.volume * 50)}%`);
    else if (/^[+]+$/.test(vol)) {
      if (Math.round(song.dispatcher.volume * 50) >= 100) return msg.send(`📢 Volume: ${Math.round(song.dispatcher.volume * 50)}%`);
      song.dispatcher.setVolume(Math.min(((song.dispatcher.volume * 50) + (2 * (vol.split("+").length - 1))) / 50, 2));
      return msg.send(`${song.dispatcher.volume === 2 ? "📢" : "🔊"} Volume: ${Math.round(song.dispatcher.volume * 50)}%`);
    } else if (/^[-]+$/.test(vol)) {
      if (Math.round(song.dispatcher.volume * 50) <= 0) return msg.send(`🔇 Volume: ${Math.round(song.dispatcher.volume * 50)}%`);
      song.dispatcher.setVolume(Math.max(((song.dispatcher.volume * 50) - (2 * (vol.split("-").length - 1))) / 50, 0));
      return msg.send(`${song.dispatcher.volume === 0 ? "🔇" : "🔉"} Volume: ${Math.round(song.dispatcher.volume * 50)}%`);
    }
    throw "Uhm? This is not how you use the volume command.";
  } catch (e) {
    return msg.send(e);
  }
};

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["vol"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 10,
  guilds: managerMusic.guilds,
};

exports.help = {
  name: "volume",
  description: "Manage the volume for current song.",
  usage: "[control:str]",
  usageDelim: "",
  extendedHelp: [
    "Let's break it down!",
    "",
    "Listen carefully, you use this command by doing either 'volume ++++' or 'volume ----'.",
    "The more '+' you write, the more the volume will increment.",
    "The more '-' you write, the more the volume will decrease.",
    "",
    "👌",
  ].join("\n"),
};
