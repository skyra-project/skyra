const { Command } = require('../../index');
const ModLog = require('../../utils/createModlog.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 2,
            botPerms: ['MUTE_MEMBERS'],
            mode: 2,
            cooldown: 5,

            usage: '<SearchMember:user> [reason:string] [...]',
            usageDelim: ' ',
            description: 'Voice Unmute the mentioned user.'
        });
    }

    async run(msg, [user, ...reason]) {
        const member = await msg.guild.fetchMember(user.id).catch(() => { throw msg.language.get('USER_NOT_IN_GUILD'); });

        if (user.id === msg.author.id) throw msg.language.get('COMMAND_USERSELF');
        else if (user.id === this.client.user.id) throw msg.language.get('COMMAND_TOSKYRA');
        else if (member.highestRole.position >= msg.member.highestRole.position) throw msg.language.get('COMMAND_ROLE_HIGHER');

        if (member.serverMute === false) throw msg.language.get('GUILD_MUTE_NOT_FOUND');

        reason = reason.length ? reason.join(' ') : null;
        await member.setDeaf(false, reason);

        const modcase = await new ModLog(msg.guild)
            .setModerator(msg.author)
            .setUser(user)
            .setType('vunmute')
            .setReason(reason)
            .send();

        return msg.send(msg.language.get('COMMAND_UNMUTE_MESSAGE', user, reason, modcase));
    }

};
