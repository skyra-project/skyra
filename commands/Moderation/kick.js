const { Command } = require('../../index');
const ModLog = require('../../utils/createModlog.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 2,
            botPerms: ['KICK_MEMBERS'],
            mode: 2,

            usage: '<SearchMember:user> [reason:string] [...]',
            usageDelim: ' ',
            description: 'Kick the mentioned user.'
        });
    }

    async run(msg, [user, ...reason]) {
        const member = await msg.guild.fetchMember(user.id).catch(() => { throw msg.language.get('USER_NOT_IN_GUILD'); });

        if (user.id === msg.author.id) throw msg.language.get('COMMAND_USERSELF');
        else if (user.id === this.client.user.id) throw msg.language.get('COMMAND_TOSKYRA');
        else if (member) {
            if (member.highestRole.position >= msg.member.highestRole.position) throw msg.language.get('COMMAND_ROLE_HIGHER');
            else if (!member.bannable) throw msg.language.get('COMMAND_KICK_NOT_KICKABLE');
        }

        reason = reason.length ? reason.join(' ') : null;
        user.action = 'kick';
        await msg.guild.ban(user.id, { days: 1, reason });
        msg.send(msg.language.get('COMMAND_KICK_MESSAGE', user, reason)).catch(() => null);
        return new ModLog(msg.guild)
            .setModerator(msg.author)
            .setUser(user)
            .setType('kick')
            .setReason(reason)
            .send();
    }

};
