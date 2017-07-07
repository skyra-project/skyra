exports.conf = {
    enabled: true,
    spamProtection: true,
    priority: 6,
};

exports.run = (client, msg, cmd) => {
    if (!msg.guild || cmd.conf.override || msg.hasLevel(2)) return false;
    return msg.guild.settings.disabledCmdChannels.includes(msg.channel.id);
};
