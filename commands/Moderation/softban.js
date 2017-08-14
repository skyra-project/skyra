const { Command } = require('../../index');
const ModLog = require('../../utils/createModlog.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 2,
            botPerms: ['BAN_MEMBERS'],
            mode: 2,
            cooldown: 5,

            usage: '<SearchMember:user> [days:integer] [reason:string] [...]',
            usageDelim: ' ',
            description: 'Softbans the mentioned user.'
        });
    }

    async run(msg, [user, days = 7, ...reason]) {
        const member = await msg.guild.fetchMember(user.id).catch(() => { throw msg.language.get('USER_NOT_IN_GUILD'); });

        if (user.id === msg.author.id) throw msg.language.get('COMMAND_USERSELF');
        else if (user.id === this.client.user.id) throw msg.language.get('COMMAND_TOSKYRA');
        else if (member) {
            if (member.highestRole.position >= msg.member.highestRole.position) throw msg.language.get('COMMAND_ROLE_HIGHER');
            else if (!member.bannable) throw msg.language.get('COMMAND_BAN_NOT_BANNABLE');
        }

        reason = reason.length ? reason.join(' ') : null;
        user.action = 'softban';
        await msg.guild.ban(user, { days, reason: `${reason ? `Softban with reason: ${reason}` : null}` });
        await msg.guild.unban(user, 'Softban.');
        msg.send(msg.language.get('COMMAND_SOFTBAN_MESSAGE', user, reason)).catch(() => null);
        return new ModLog(msg.guild)
            .setModerator(msg.author)
            .setUser(user)
            .setType('softban')
            .setReason(reason)
            .send();
    }

};
