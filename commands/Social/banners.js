/* eslint-disable import/no-dynamic-require */
exports.run = async (client, msg) => {
  try {
    const banners = require(`${client.clientBaseDir}assets/banners.json`).wave1;
    const list = [];
    for (const key in banners) {
      if (banners.hasOwnProperty(key)) {
        list.push(banners[key].author);
      }
    }
    msg.sendCode(list.join("\n"));
  } catch (e) {
    msg.error(e);
  }
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
