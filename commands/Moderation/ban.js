const { Command, ModLog } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 2,
            botPerms: ['BAN_MEMBERS'],
            mode: 2,

            cooldown: 5,

            usage: '<SearchMember:user> [reason:string] [...]',
            usageDelim: ' ',
            description: 'Ban the mentioned user.'
        });
    }

    async run(msg, [user, ...reason]) {
        const member = await msg.guild.fetchMember(user.id).catch(() => null);

        if (user.id === msg.author.id) throw msg.language.get('COMMAND_USERSELF');
        else if (user.id === this.client.user.id) throw msg.language.get('COMMAND_TOSKYRA');
        else if (member) {
            if (member.highestRole.position >= msg.member.highestRole.position) throw msg.language.get('COMMAND_ROLE_HIGHER');
            else if (!member.bannable) throw msg.language.get('COMMAND_BAN_NOT_BANNABLE');
        }

        reason = reason.length ? reason.join(' ') : null;
        user.action = 'ban';
        await msg.guild.ban(user.id, { days: 1, reason });

        const modcase = await new ModLog(msg.guild)
            .setModerator(msg.author)
            .setUser(user)
            .setType('ban')
            .setReason(reason)
            .send();

        return msg.send(msg.language.get('COMMAND_BAN_MESSAGE', user, reason, modcase));
    }

};
