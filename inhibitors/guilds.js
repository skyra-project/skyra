exports.conf = {
    enabled: true,
    spamProtection: false,
    priority: 5,
};

exports.run = (client, msg, cmd) => {
    if (msg.channel.type !== "text" || !cmd.conf.guilds) return false;
    return !cmd.conf.guilds.includes(msg.guild.id);
};
