exports.conf = {
    enabled: true,
    spamProtection: false,
    priority: 6,
};

exports.run = (client, msg, cmd) => {
    if (msg.channel.type !== "text"
        || !cmd.conf.mode
        || msg.guild.settings.mode <= cmd.conf.mode) return false;
    return true;
};
