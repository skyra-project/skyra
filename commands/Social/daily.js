const moment = require("moment");

/* eslint-disable no-throw-literal */
exports.run = async (client, msg) => {
  const now = new Date().getTime();

  if (msg.author.profile.timeDaily + 43200000 > now) {
    const remaining = (msg.author.profile.timeDaily + 43200000) - now;
    return msg.alert(`Dailies are available in ${moment.duration(remaining).format("hh [**hours**,] mm [**mins**,] ss [**secs**]")}.`);
  }
  const money = await client.Social.win(msg, 200);
  await msg.author.profile.update({ timeDaily: now });
  return msg.send(`You have just earned ${money}₪! Next dailies are available in 12 hours.`);
};


exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 1,
  cooldown: 60,
};

exports.help = {
  name: "daily",
  description: "Get your daily shekels.",
  usage: "",
  usageDelim: " ",
  extendedHelp: [
    "Skyra, where is my money?",
    "",
    "I want to play slotmachines...",
    "",
    "You can claim dailies twice a day (every 12h), make sure you don't waste it!",
  ].join("\n"),
};
