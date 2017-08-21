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

            usage: '<SearchMember:user> [reason:string] [...]',
            usageDelim: ' ',
            description: 'Unbans an user (you MUST write his full Discord Tag or his ID).'
        });
    }

    async run(msg, [query, ...unbanReason]) {
        const { user, reason } = await this.fetchBan(msg.guild, query);

        unbanReason = unbanReason.length > 0 ? unbanReason.join(' ') : null;
        user.action = 'unban';
        await msg.guild.unban(user.id, unbanReason);

        const modcase = await new ModLog(msg.guild)
            .setModerator(msg.author)
            .setUser(user)
            .setType('unban')
            .setReason(unbanReason)
            .send();

        return msg.send(msg.language.get('COMMAND_UNBAN_MESSAGE', user, reason, unbanReason, modcase));
    }

    async fetchBan(guild, query) {
        const users = await guild.fetchBans();
        if (users.size === 0) throw guild.language('GUILD_BANS_EMPTY');
        const member = users.get(query) || users.find(mem => mem.user.tag === query) || null;
        if (member === null) throw guild.language('GUILD_BANS_NOT_FOUND');
        return member;
    }

};
