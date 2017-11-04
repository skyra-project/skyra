const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            botPerms: ['EMBED_LINKS'],
            mode: 2,
            cooldown: 10,

            usage: '[role:advrole]',
            description: 'Check the statistics for a role.'
        });
    }

    async run(msg, [role = msg.member.highestRole], settings, i18n) {
        const permissions = role.permissions.serialize();
        const TITLES = i18n.language.COMMAND_ROLEINFO_TITLES;

        const embed = new MessageEmbed()
            .setColor(role.color || 0xdfdfdf)
            .setDescription(`${i18n.get('COMMAND_ROLEINFO_DESCRIPTION', role)}\n\u200B`)
            .addField(TITLES.PERMISSIONS, i18n.get('COMMAND_ROLEINFO_PERMISSIONS', Object.keys(permissions).filter(key => permissions[key])), true);

        return msg.send({ embed });
    }

};
