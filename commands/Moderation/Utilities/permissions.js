const { Command } = require('../../../index');
const { Permissions, MessageEmbed } = require('discord.js');

const PermissionFlags = Object.keys(Permissions.FLAGS);

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            botPerms: ['EMBED_LINKS'],
            permLevel: 2,
            mode: 2,
            cooldown: 30,

            usage: '[member:string]',
            description: 'Check the permission for a member, or yours.'
        });
    }

    async run(msg, [input = msg.member], settings, i18n) {
        const user = typeof input === 'string' ? await this.client.handler.search.user(input, msg) : msg.author;

        if (!user) throw i18n.get('REQUIRE_USER');
        const member = await msg.guild.members.fetch(user.id).catch(() => { throw i18n.get('USER_NOT_IN_GUILD'); });

        const { permissions } = member;
        const perm = ['\u200B'];
        for (let i = 0; i < PermissionFlags.length; i++)
            perm.push(`${permissions.has(PermissionFlags[i]) ? '\\🔹' : '\\🔸'} ${i18n.PERMISSIONS[PermissionFlags[i]] || PermissionFlags[i]}`);

        const embed = new MessageEmbed()
            .setColor(member.highestRole.color || 0xdfdfdf)
            .setTitle(i18n.get('COMMAND_PERMISSIONS', user.tag, user.id))
            .setDescription(perm.join('\n'));

        return msg.send({ embed });
    }

};
