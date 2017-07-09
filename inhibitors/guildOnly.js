exports.conf = {
    enabled: true,
    spamProtection: false,
    priority: 8,
};

exports.run = (client, msg, cmd) => {
    if (cmd.conf.guildOnly) {
        return msg.channel.type !== "text";
    }
    return false;
};
