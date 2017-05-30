exports.run = (client, messageReaction, user) => {
  try {
    const message = messageReaction.message;
    if (user.bot || message.author.id !== client.user.id) return;
    const reactionCmd = this.reactionCommands[messageReaction.emoji.name];
    if (!reactionCmd) return;
    const response = client.commandMessages.find(m => m.response.id === message.id);
    if (!response || user.id !== response.trigger.author.id) return;
    const msg = response.trigger;
    reactionCmd({ client, msg, message });
  } catch (e) {} // eslint-disable-line no-empty
};

exports.reactionCommands = {
  "🗑": params => this.reactionCommands["❌"](params),
  "❌": ({ message }) => message.nuke(),
  "🔎": params => this.reactionCommands["🔍"](params),
  "🔍": ({ client, msg }) => client.commands.get("help").run(client, msg, [msg.cmdMsg.cmd.help.name]),
};
