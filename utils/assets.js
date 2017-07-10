const options = {
    name: "Muted",
    color: 0x422c0b,
    mentionable: false,
    hoist: false,
};

exports.createMuted = async (msg) => {
    if (msg.guild.settings.roles.muted) throw new Error("There's already a muted role.");
    const role = await msg.guild.createRole(options);
    const channels = msg.guild.channels;
    await msg.send(`Applying permissions (\`SEND_MESSAGES\`:\`false\`) for ${channels.size} to ${role}...`);
    const denied = [];
    let accepted = 0;

    for (const channel of channels.values()) { // eslint-disable-line no-restricted-syntax
        if (channel.type === "text") channel.overwritePermissions(role, { SEND_MESSAGES: false }).catch(() => denied.push(channel.toString()));
        else channel.overwritePermissions(role, { CONNECT: false }).catch(() => denied.push(channel.toString()));
        accepted += 1;
    }

    const messageEdit2 = denied.length ? `, with exception of ${denied.join(", ")}.` : ". ";
    await msg.guild.settings.update({ roles: { muted: role.id } });
    await msg.send(`Permissions applied for ${accepted} channels${messageEdit2}Dear ${msg.author}, don't forget to tweak the permissions in the channels you want ${role} to send messages.`);
    return true;
};

exports.shiny = msg => (msg.channel.permissionsFor(msg.guild.me).has("USE_EXTERNAL_EMOJIS") ? "<:ShinyYellow:324157128270938113>" : "S");

exports.color = (msg) => {
    const profile = msg.author.profile;
    if (profile) {
        return parseInt(`0x${msg.author.profile.color}`);
    } else if (msg.guild) {
        if (msg.member) return msg.member.highestRole.color;
    }
    return 14671839;
};
