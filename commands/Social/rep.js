const moment = require("moment");

/* eslint-disable no-throw-literal */
exports.run = async (client, msg, [search]) => {
  try {
    const now = new Date().getTime();

    if (msg.author.profile.timerep + 86400000 > now) {
      const remaining = (msg.author.profile.timerep + 86400000) - now;
      msg.alert(`You can give a reputation point in ${moment.duration(remaining).format("hh [**hours**,] mm [**mins**,] ss [**secs**]")}.`, 10000);
    } else {
      const user = await client.search.User(search, msg.guild);
      if (msg.author.id === user.id) throw "You can't give a reputation point to yourself.";
      else if (user.bot) throw "You can't give reputation points to bots.";

      await client.rethink.update("users", msg.author.id, { timerep: now });
      client.cacheProfiles.get(msg.author.id).timerep = now;

      await client.rethink.update("users", user.id, { reputation: user.profile.reputation + 1 });
      client.cacheProfiles.get(user.id).reputation = user.profile.reputation + 1;

      msg.send(`Dear ${msg.author}, you have just give one reputation point to **${user.username}**`);
    }
  } catch (e) {
    msg.error(e);
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
  description: "Pay somebody with your shekels.",
  usage: "<user:str>",
  usageDelim: "",
  extendedHelp: "",
};
