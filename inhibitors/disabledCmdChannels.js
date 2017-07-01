exports.conf = {
    enabled: true,
    spamProtection: true,
    priority: 6,
};

exports.run = (client, msg, cmd) => {
    if (msg.channel.type !== "text" || cmd.conf.override) return false;

    return msg.guild.settings.disabledCmdChannels.includes(msg.channel.id);
};
