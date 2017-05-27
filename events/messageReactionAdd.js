exports.run = (client, messageReaction, user) => {
  const message = messageReaction.message;
  if (user.bot || message.author.id !== client.user.id) return;
  const reactionCmd = this.reactionCommands[messageReaction.emoji.name];
  if (!reactionCmd) return;
  const response = client.commandMessages.find(m => m.response.id === message.id);
  const msg = response.trigger;
  if (!response || user.id !== msg.author.id) return;
  reactionCmd({ client, msg, message });
};

exports.reactionCommands = {
  "🗑": params => this.reactionCommands["❌"](params),
  "❌": ({ message }) => message.nuke(),
  "🔎": params => this.reactionCommands["🔍"](params),
  "🔍": ({ client, msg }) => client.commands.get("help").run(client, msg, [msg.cmdMsg.cmd.help.name]),
};
