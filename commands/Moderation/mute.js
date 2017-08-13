const { Command } = require('../../index');
const ModLog = require('../../utils/createModlog.js');
const Assets = require('../../utils/assets');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, 'mute', {
            guildOnly: true,
            permLevel: 2,
            botPerms: ['MANAGE_ROLES'],
            mode: 2,

            usage: '<SearchMember:user> [reason:string] [...]',
            usageDelim: ' ',
            description: 'Mute the mentioned user.'
        });
    }

    async run(msg, [user, ...reason]) {
        const member = await msg.guild.fetchMember(user.id).catch(() => { throw msg.language.get('USER_NOT_IN_GUILD'); });

        if (user.id === msg.author.id) throw msg.language.get('COMMAND_USERSELF');
        else if (user.id === this.client.user.id) throw msg.language.get('COMMAND_TOSKYRA');
        else if (member.highestRole.position >= msg.member.highestRole.position) throw msg.language.get('COMMAND_ROLE_HIGHER');

        const mute = await this.configuration(msg);
        if (msg.guild.settings.moderation.mutes.has(user.id)) throw msg.language.get('COMMAND_MUTE_MUTED');

        reason = reason.length ? reason.join(' ') : null;
        const roles = member._roles;
        await member.edit({ roles: [mute.id] });

        await msg.guild.ban(user.id, { days: 1, reason });
        msg.send(msg.language.get('COMMAND_MUTE_MESSAGE', user, reason)).catch(() => null);
        return new ModLog(msg.guild)
            .setModerator(msg.author)
            .setUser(user)
            .setType('mute')
            .setReason(reason)
            .setExtraData(roles)
            .send();
    }

    async configuration(msg) {
        if (!msg.guild.settings.roles.muted) {
            await msg.prompt(msg.language.get('COMMAND_MUTE_CONFIGURE'))
                .catch(() => { throw msg.language.get('COMMAND_MUTE_CONFIGURE_CANCELLED'); });
            await msg.send(msg.language.get('SYSTEM_PROCESSING'));
            return Assets.createMuted(msg);
        }
        return msg.guild.roles.get(msg.guild.settings.roles.muted);
    }

};
