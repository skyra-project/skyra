exports.run = async (client, msg) => {
    let autoRole;
    const roles = msg.guild.settings.autoroles.length ? msg.guild.settings.autoroles.filter(au => au.points > msg.member.points.score) : [];
    if (roles.length) autoRole = roles.sort((a, b) => (a.points > b.points ? 1 : -1))[0];
    const nextRole = autoRole ? `\nPoints for next rank: **${autoRole.points - msg.member.points.score}** (at ${autoRole.points} points).` : "";
    return msg.send(`Dear ${msg.author}, you have a total of **${msg.member.points.score}** points.${nextRole}`);
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: [],
    permLevel: 0,
    botPerms: [],
    requiredFuncs: [],
    spam: true,
    mode: 1,
    cooldown: 10,
};

exports.help = {
    name: "mylevel",
    description: "Check your current level",
    usage: "",
    usageDelim: "",
    extendedHelp: "",
};
