exports.conf = {
    enabled: true,
    spamProtection: true,
    priority: 6,
};

exports.run = (client, msg, cmd) => {
    if (msg.channel.type !== "text" || cmd.conf.override) return false;
    if (msg.author.id === client.config.ownerID) return false;

    return msg.guild.configs.disabledCmdChannels.includes(msg.channel.id);
};
