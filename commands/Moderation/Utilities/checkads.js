const { Command } = require('../../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            aliases: ['ads'],
            mode: 2,
            permLevel: 1,
            cooldown: 15,

            description: 'Check who has an invite link in the playing field.'
        });

        this.regExp = /(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i;
    }

    async run(msg, params, settings, i18n) {
        if ((msg.guild.members.size / msg.guild.memberCount) * 100 < 90) {
            await msg.send(i18n.get('SYSTEM_FETCHING'));
            await msg.guild.members.fetch();
        }

        const members = [];
        for (const member of msg.guild.members.values()) {
            if (member.presence.activity && this.regExp.test(member.presence.activity.name))
                members.push(`${member} ${member.displayName} || ${member.presence.activity.name}`);
        }

        if (members.length === 0)
            return i18n.get('COMMAND_LIST_ADVERTISEMENT_EMPTY');

        const embed = new MessageEmbed()
            .setTitle(i18n.get('COMMAND_LIST_ADVERTISEMENT'))
            .splitFields(members.join('\n'));

        return msg.send({ embed });
    }

};
