const figlet = require("figlet");

exports.run = async (client, msg, [banner]) => {
  figlet(banner, (err, data) => {
    if (err) msg.error(err);
    msg.sendCode("", data).catch(e => msg.error(e));
  });
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: true,
  mode: 0,
};

exports.help = {
  name: "banner",
  description: "Creates an ASCII banner from the string you supply",
  usage: "<banner:str>",
  usageDelim: "",
  extendedHelp: [
    "Usage",
    "&banner <text>",
    "",
    " _   _ _",
    "| | | (_)",
    "| |_| | |",
    "|  _  | |",
    "|_| |_|_|",
  ].join("\n"),
};
