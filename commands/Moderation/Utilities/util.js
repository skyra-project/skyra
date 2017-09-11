const { Command } = require('../../../index');
const { Permissions, MessageEmbed } = require('discord.js');
const moment = require('moment');

const PermissionFlags = Object.keys(Permissions.FLAGS);

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 2,
            mode: 2,
            cooldown: 30,

            usage: '<channel|permissions|invite> [search:string] [...]',
            usageDelim: ' ',
            description: 'Use some of the utilities.'
        });
    }

    async run(msg, [action, ...parameters], settings, i18n) {
        return this[action](msg, parameters.length > 0 ? parameters.join(' ') : undefined, i18n);
    }

    async channel(msg, input = msg.channel) {
        const channel = await this.client.handler.search.channel(input, msg);

        const roleInfo = channel.permissionOverwrites.map((perm) => {
            const type = perm.type === 'role' ? this.guild.roles.get(perm.id) : this.guild.members.get(perm.id);
            return `• ${type} (${perm.type}) has the permissions:${perm.allowed.bitfield !== 0 ? this.resolve(perm.allowed, '+') : ''}${perm.denied.bitfield !== 0 ? this.resolve(perm.denied, '-') : ''}`;
        }).join('\n\n');
        const embed = new MessageEmbed()
            .setColor(msg.member.highestRole.color || 0xdfdfdf)
            .setDescription(`Info on **${channel.name}** (ID: ${channel.id})`)
            .addField('❯ Channel info', [
                `• **Type:** ${channel.type}`,
                `• **Created at:** ${moment.utc(channel.createdAt).format('D/MM/YYYY [at] HH:mm:ss')}`,
                `• **Position:** ${channel.position}`,
                `${channel.type === 'text' ?
                    `• **Topic:** ${channel.topic === null ? 'Not set' : channel.topic}` :
                    `• **Bitrate:** ${channel.bitrate}\n• **User limit:** ${channel.userLimit}`}`
            ].join('\n'))
            .splitFields(roleInfo)
            .setTimestamp();

        return msg.send({ embed });
    }

    async permissions(msg, input, i18n) {
        const user = await this.client.handler.search.user(input, msg);
        const member = await msg.guild.fetchMember(user.id).catch(() => { throw i18n.get('USER_NOT_IN_GUILD'); });

        const { permissions } = member;
        const perm = ['\u200B'];
        for (let i = 0; i < PermissionFlags.length; i++) {
            perm.push(`${permissions.has(PermissionFlags[i]) ? '\\🔹' : '\\🔸'} ${i18n.PERMISSIONS[PermissionFlags[i]] || PermissionFlags[i]}`);
        }

        const embed = new MessageEmbed()
            .setColor(msg.guild.members.get(member.user.id).highestRole.color || 0xdfdfdf)
            .setTitle(`Permissions for ${member.user.tag} (${member.user.id})`)
            .setDescription(perm);

        return msg.send({ embed });
    }

    async invite(msg, input) {
        if (!/(discord\.gg\/|discordapp\.com\/invite\/).+/.test(input)) throw 'You must provide a valid invite link.';
        const inviteCode = /(discord\.gg\/|discordapp\.com\/invite\/)([^ ]+)/.exec(input);
        if (inviteCode === null) throw 'Are you sure you provided a valid code?';
        const code = inviteCode[2];
        const invite = await this.client.fetchInvite(code);

        const embed = new MessageEmbed()
            .setColor(msg.color)
            .setFooter(`Invite created by: ${invite.inviter ? invite.inviter.tag : 'Unknown'}`, (invite.inviter || msg.author).displayAvatarURL({ size: 128 }))
            .setThumbnail(invite.guild.icon ? `https://cdn.discordapp.com/icons/${invite.guild.id}/${invite.guild.icon}.webp` : null)
            .setTitle(`**${invite.guild.name}** (${invite.guild.id})`)
            .setDescription([
                `**${invite.memberCount}** members, **${invite.presenceCount}** users online.`,
                `**${invite.textChannelCount}** text channels and **${invite.voiceChannelCount}** voice channels.`,
                `Inviter: ${invite.inviter ? `**${invite.inviter.tag}** (${invite.inviter.id})` : 'Unknown'}`,
                `Channel: **#${invite.channel.name}** (${invite.channel.id})`
            ].join('\n'));

        return msg.send({ embed });
    }

};
