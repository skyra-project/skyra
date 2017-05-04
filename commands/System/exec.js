const { exec } = require("child_process");

exports.run = async (client, msg, [input]) => {
  if (msg.deletable) msg.nuke();
  exec(input, (error, stdout) => {
    const output = stdout ? `**\`OUTPUT\`**${"```"}\n${stdout}\n${"```"}` : "";
    const outerr = error ? `**\`ERROR\`**${"```"}\n${error}\n${"```"}` : "";
    msg.send([output, outerr].join("\n")).then(m => m.nuke(60000)).catch(e => msg.error(e));
  });
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 10,
  botPerms: [],
  requiredFuncs: [],
  spam: false,
  mode: 2,
};

exports.help = {
  name: "exec",
  description: "Execute Order 66.",
  usage: "<expression:str>",
  usageDelim: "",
  extendedHelp: "",
};
