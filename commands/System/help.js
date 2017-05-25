/* eslint-disable guard-for-in, no-restricted-syntax, no-prototype-builtins */
exports.run = async (client, msg, [cmd]) => {
  const method = !client.config.selfbot ? "author" : "channel";
  cmd = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (cmd) {
    return msg[method].send([
      `= ${cmd.help.name} = `,
      cmd.help.description,
      `usage :: ${cmd.usage.fullUsage(msg)}`,
      "Extended Help ::",
      cmd.help.extendedHelp || "No extended help available.",
    ].join("\n"), { code: "asciidoc" });
  }
  const help = this.buildHelp(client, msg);
  const helpMessage = [];
  for (const key in help) {
    helpMessage.push(`**${key} Commands**: \`\`\`asciidoc`);
    for (const key2 in help[key]) helpMessage.push(`= ${key2} =`, `${help[key][key2].join("\n")}\n`);
    helpMessage.push("```\n\u200b");
  }
  return msg[method].send(helpMessage, { split: { char: "\u200b" } }).catch(err => client.emit("error", err))
    .then(() => { if (msg.channel.type !== "dm" && !client.config.selfbot) msg.sendMessage("Commands have been sent to your DMs."); });
};

exports.conf = {
  enabled: true,
  runIn: ["text", "dm", "group"],
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: [],
};

exports.help = {
  name: "help",
  description: "Display help for a command.",
  usage: "[command:str]",
  usageDelim: "",
};

exports.buildHelp = (client, msg) => {
  const help = {};

  const commandNames = Array.from(client.commands.keys());
  const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

  client.commands.forEach((command) => {
    if (this.runCommandInhibitors(client, msg, command)) {
      const cat = command.help.category;
      const subcat = command.help.subCategory;
      if (!help.hasOwnProperty(cat)) help[cat] = {};
      if (!help[cat].hasOwnProperty(subcat)) help[cat][subcat] = [];
      help[cat][subcat].push(`${msg.guild ? msg.guild.configs.prefix : "&"}${command.help.name}${" ".repeat(longest - command.help.name.length)} :: ${command.help.description}`);
    }
  });

  return help;
};

exports.runCommandInhibitors = (client, msg, command) => !client.commandInhibitors.some((inhibitor) => {
  if (!inhibitor.conf.spamProtection && inhibitor.conf.enabled) return inhibitor.run(client, msg, command);
  return false;
});
