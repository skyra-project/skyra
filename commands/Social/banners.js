/* eslint-disable import/no-dynamic-require, no-restricted-syntax, no-prototype-builtins */
exports.run = async (client, msg) => {
  const banners = require(`${client.clientBaseDir}assets/banners.json`).wave1;
  const list = [];
  for (const key in banners) {
    if (key in banners) list.push(banners[key].author);
  }
  await msg.send(list.join("\n"), { code: true });
};


exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 1,
  cooldown: 60,
};

exports.help = {
  name: "banners",
  description: "Check how many reputation points do you have.",
  usage: "",
  usageDelim: " ",
  extendedHelp: "",
};
