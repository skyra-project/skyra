exports.run = (client, msg) => msg.send("Deprecated command. Use 'roles' instead. Use `Skyra, help roles` to know how to use the new command and its usage.");

exports.conf = {
  enabled: true,
  runIn: ["text"],
  aliases: ["getrole", "unclaim", "leaverole"],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
  cooldown: 10,
};

exports.help = {
  name: "claim",
  description: "Deprecated command. Use 'roles' instead.",
  usage: "",
  usageDelim: "",
  extendedHelp: "",
};
