const options = {
    name: 'Muted',
    color: 0x422c0b,
    mentionable: false,
    hoist: false
};

const pushRole = (channel, role, permission, array) => channel.overwritePermissions(role, permission).catch(() => array.push(channel.toString()));

class Assets {

    static async createMuted(msg) {
        if (msg.guild.settings.roles.muted) throw new Error("There's already a muted role.");
        const role = await msg.guild.createRole(options);
        const channels = msg.guild.channels;
        await msg.send(`Applying permissions (\`SEND_MESSAGES\`:\`false\`) for ${channels.size} to ${role}...`);
        const denied = [];
        let accepted = 0;

        for (const channel of channels.values()) { // eslint-disable-line no-restricted-syntax
            if (channel.type === 'text') await pushRole(channel, role, { SEND_MESSAGES: false }, denied);
            else await pushRole(channel, role, { CONNECT: false }, denied);
            accepted += 1;
        }

        const messageEdit2 = denied.length ? `, with exception of ${denied.join(', ')}.` : '. ';
        await msg.guild.settings.update({ roles: { muted: role.id } });
        await msg.send(`Permissions applied for ${accepted} channels${messageEdit2}Dear ${msg.author}, don't forget to tweak the permissions in the channels you want ${role} to send messages.`);
        return role;
    }

}

module.exports = Assets;
