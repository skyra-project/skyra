const { Command } = require('../../index');
const ModLog = require('../../utils/createModlog.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 2,
            botPerms: ['MANAGE_ROLES'],
            mode: 2,
            cooldown: 5,

            usage: '<SearchMember:user> [reason:string] [...]',
            usageDelim: ' ',
            description: 'Unmute the mentioned user.'
        });
    }

    async run(msg, [user, ...reason], settings) {
        const member = await msg.guild.fetchMember(user.id).catch(() => { throw msg.language.get('USER_NOT_IN_GUILD'); });

        if (user.id === msg.author.id) throw msg.language.get('COMMAND_USERSELF');
        else if (user.id === this.client.user.id) throw msg.language.get('COMMAND_TOSKYRA');

        if (member.highestRole.position >= msg.member.highestRole.position) throw msg.language.get('COMMAND_ROLE_HIGHER');

        if (!settings.roles.muted) throw msg.language.get('GUILD_SETTINGS_ROLES_MUTED');
        const role = msg.guild.roles.get(settings.roles.muted);
        if (!role) {
            await settings.update({ roles: { muted: null } });
            throw msg.language.get('GUILD_SETTINGS_ROLES_MUTED');
        }

        const mutedUsed = await settings.moderation.getMute(user.id);
        if (!mutedUsed) throw msg.language.get('GUILD_MUTE_NOT_FOUND');

        const roles = mutedUsed.extraData || [];

        reason = reason.length ? reason.join(' ') : null;
        await member.edit({ roles });

        const modcase = await new ModLog(msg.guild)
            .setModerator(msg.author)
            .setUser(user)
            .setType('unmute')
            .setReason(reason)
            .send();

        return msg.send(msg.language.get('COMMAND_UNMUTE_MESSAGE', user, reason, modcase));
    }

};
