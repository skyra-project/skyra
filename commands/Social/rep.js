const moment = require("moment");

/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [search]) => {
  const now = new Date().getTime();

  if (msg.author.profile.timerep + 86400000 > now) {
    const remaining = (msg.author.profile.timerep + 86400000) - now;
    await msg.alert(`You can give a reputation point in ${moment.duration(remaining).format("hh [**hours**,] mm [**mins**,] ss [**secs**]")}.`, 10000);
  } else {
    const user = await client.search.User(search, msg.guild);
    if (msg.author.id === user.id) throw "You can't give a reputation point to yourself.";
    else if (user.bot) throw "You can't give reputation points to bots.";

    await user.profile.update({ reputation: user.profile.reputation + 1 });
    await msg.author.profile.update({ timerep: now });

    await msg.send(`Dear ${msg.author}, you have just given one reputation point to **${user.username}**`);
  }
};


exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["reputation"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 1,
  cooldown: 60,
};

exports.help = {
  name: "rep",
  description: "Give somebody a reputation point!",
  usage: "<user:str>",
  usageDelim: "",
  extendedHelp: [
    "This guy is so helpful... I'll give him a reputation point!",
    "",
    "You can give reputation points once per 24h, make sure you choose the right user!",
  ].join("\n"),
};
