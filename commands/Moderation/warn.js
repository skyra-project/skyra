const { Command, ModLog } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['warning'],
            guildOnly: true,
            permLevel: 1,
            mode: 2,
            cooldown: 5,

            usage: '<SearchMember:user> [reason:string] [...]',
            usageDelim: ' ',
            description: 'Warn the mentioned user.'
        });
    }

    async run(msg, [user, ...reason]) {
        const member = await msg.guild.fetchMember(user.id).catch(() => { throw msg.language.get('USER_NOT_IN_GUILD'); });

        if (user.id === msg.author.id) throw msg.language.get('COMMAND_USERSELF');
        else if (user.id === this.client.user.id) throw msg.language.get('COMMAND_TOSKYRA');
        else if (member.highestRole.position >= msg.member.highestRole.position) throw msg.language.get('COMMAND_ROLE_HIGHER');

        reason = reason.length ? reason.join(' ') : null;

        const modcase = await new ModLog(msg.guild)
            .setModerator(msg.author)
            .setUser(user)
            .setType('warn')
            .setReason(reason)
            .send();

        return msg.send(msg.language.get('COMMAND_WARN_MESSAGE', user, reason, modcase));
    }

};
