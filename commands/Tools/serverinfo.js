const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            aliases: ['serverstats'],
            mode: 2,
            cooldown: 30,

            description: 'Check the statistics for this server.'
        });
    }

    async run(msg, params, settings, i18n) {
        if ((msg.guild.members.size / msg.guild.memberCount) * 100 < 90) {
            await msg.send(i18n.get('SYSTEM_FETCHING'));
            await msg.guild.fetchMembers();
        }

        let offline = 0;
        let online = 0;
        let newbies = 0;
        for (const member of msg.guild.members.values()) {
            if (member.user.presence.status === 'offline') offline++;
            else online++;
            if (member.joinedAt > msg.createdTimestamp - 86400000) newbies++;
        }

        let TChannels = 0;
        let VChannels = 0;
        let CChannels = 0;
        for (const channel of msg.guild.channels.values()) {
            if (channel.type === 'text') TChannels++;
            else if (channel.type === 'voice') VChannels++;
            else CChannels++;
        }

        const TITLES = i18n.language.COMMAND_SERVERINFO_TITLES;

        const embed = new MessageEmbed()
            .setColor(msg.member.highestRole.color || 0xdfdfdf)
            .setDescription(`${i18n.get('COMMAND_SERVERINFO_TITLE', msg.guild.name, msg.guild.id)}\n\u200B`)
            .setThumbnail(msg.guild.iconURL() || null)
            .addField(TITLES.CHANNELS, i18n.get('COMMAND_SERVERINFO_CHANNELS', TChannels, VChannels, CChannels, msg.guild.afkChannelID, msg.guild.afkTimeout), true)
            .addField(TITLES.MEMBERS, i18n.get('COMMAND_SERVERINFO_MEMBERS', msg.guild.memberCount, msg.guild.owner.user), true)
            .addField(TITLES.OTHER, i18n.get('COMMAND_SERVERINFO_OTHER', msg.guild.roles.size, msg.guild.region, msg.guild.createdAt, msg.guild.verificationLevel), true)
            .addField(TITLES.USERS, i18n.get('COMMAND_SERVERINFO_USERS', online, offline, Math.round((100 * online) / msg.guild.memberCount), newbies), true);

        return msg.send({ embed });
    }

};
