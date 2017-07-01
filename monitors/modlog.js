exports.conf = {
    enabled: true,
};

exports.run = (client, msg) => {
    if (msg.channel.type !== "text") return;
    else if (msg.author.id === client.user.id) return;
    const configs = msg.guild.settings;

    if (configs.events.modLogProtection && configs.channels.mod && msg.channel.id === configs.channels.mod && msg.deletable) msg.nuke();
};
