const options = {
    name: 'Muted',
    color: 0x422c0b,
    mentionable: false,
    hoist: false
};

const permission = {
    text: { SEND_MESSAGES: false },
    voice: { CONNECT: false }
};

const pushRole = (channel, role, array) => channel.overwritePermissions(role, permission[channel.type]).catch(() => array.push(channel.toString()));

class Assets {

    static async createMuted(msg) {
        if (msg.guild.settings.roles.muted) throw new Error("There's already a muted role.");
        const role = await msg.guild.createRole(options);
        const channels = msg.guild.channels;
        await msg.send(`Applying permissions (\`SEND_MESSAGES\`:\`false\`) for ${channels.size} to ${role}...`);
        const denied = [];
        let accepted = 0;

        for (const channel of channels.values()) { // eslint-disable-line no-restricted-syntax
            await pushRole(channel, role, denied);
            accepted += 1;
        }

        const messageEdit2 = denied.length > 1 ? `, with exception of ${denied.join(', ')}.` : '. ';
        await msg.guild.settings.update({ roles: { muted: role.id } });
        await msg.send(`Permissions applied for ${accepted} channels${messageEdit2}Dear ${msg.author}, don't forget to tweak the permissions in the channels you want ${role} to send messages.`);
        return role;
    }

}

module.exports = Assets;
