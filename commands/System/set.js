exports.run = async (client, msg, [status = null, ...game]) => {
  if (status) {
    await client.user.setStatus(status);
    await msg.alert(`Status set to: *${status}*`);
  } else
  if (game.length) {
    await client.user.setGame(game.join(" "));
    await msg.alert(`Game set to: *${game.join(" ")}*`);
  } else
  if (!game.length && !status) {
    await client.user.setStatus("online");
    await msg.alert("Status set to: *online*");
  }
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
  name: "set",
  description: "Change bot's status or game.",
  usage: "[online|idle|invisible|dnd] [game:str] [...]",
  usageDelim: "",
  extendedHelp: "",
};
