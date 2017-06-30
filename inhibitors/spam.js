exports.conf = {
    enabled: true,
    spamProtection: true,
    priority: 10.5,
};

exports.run = (client, msg, cmd) => {
    if (msg.channel.type !== "text" || !cmd.conf.spam) return false;
    if (msg.author.id === client.config.ownerID) return false;

    const spam = msg.guild.configs.channels.spam;
    if (!spam) return false;

    const spamChannel = msg.guild.channels.get(spam);
    if (!spamChannel) {
        msg.guild.configs.update({ channels: { spam: null } });
        return false;
    }

    if (msg.channel.id === spamChannel.id) return false;
    return `|\`❌\`| This command is disabled here. Would you mind going to ${spamChannel}?`;
};
