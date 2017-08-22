const { Command, util } = require('../../../index');
const { Permissions, MessageEmbed, Guild } = require('discord.js');
const moment = require('moment');

const PermissionFlags = Object.keys(Permissions.FLAGS);

const humanLevels = {
    0: 'None',
    1: 'Low',
    2: 'Medium',
    3: '(╯°□°）╯︵ ┻━┻',
    4: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 0,
            mode: 2,
            cooldown: 30,

            usage: '<channel|server|flow|permissions|perms|invite> [search:string] [...]',
            usageDelim: ' ',
            description: 'Use some of the utilities.'
        });
    }

    async run(msg, [action, ...parameters]) {
        return this[action](msg, parameters.length > 0 ? parameters.join(' ') : undefined);
    }

    async channel(msg, input = msg.channel) {
        if (await msg.hasLevel(2) !== true) throw 'you require to be at least a Moderator Member to run this command.';
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

    async server(msg, input = msg.guild) {
        const guild = input instanceof Guild ? input : this.client.guilds.get(input);
        if (!guild) throw 'Guild not found';
        if ((guild.members.size / guild.memberCount) * 100 < 90) {
            await msg.send('`Fetching data...`');
            await guild.fetchMembers();
        }

        let offline = 0;
        let online = 0;
        let newbies = 0;
        for (const member of guild.members.values()) {
            if (member.user.presence.status === 'offline') offline++;
            else online++;
            if (member.joinedAt > msg.createdTimestamp - 86400000) newbies++;
        }

        const embed = new MessageEmbed()
            .setColor(msg.member.highestRole.color || 0xdfdfdf)
            .setDescription(`Info on **${guild.name}** (ID: **${guild.id}**)\n\u200B`)
            .setThumbnail(guild.iconURL() || null)
            .addField('❯ Channels', [
                `• **${guild.channels.filter(ch => ch.type === 'text').size}** Text, **${guild.channels.filter(ch => ch.type === 'voice').size}** Voice\n`,
                `• Default: **${guild.defaultChannel}**`,
                `• AFK: ${guild.afkChannelID ? `**<#${guild.afkChannelID}>** after **${guild.afkTimeout / 60}**min` : '**None.**'}`
            ].join('\n'), true)
            .addField('❯ Member', [
                `• **${guild.memberCount}** members`,
                `• Owner: **${guild.owner.user.tag}**`,
                `  (ID: **${guild.ownerID}**)`
            ].join('\n'), true)
            .addField('❯ Other', [
                `• Roles: **${guild.roles.size}**`,
                `• Region: **${guild.region}**`,
                `• Created at: **${moment.utc(guild.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}** (UTC)`,
                `• Verification Level: **${humanLevels[guild.verificationLevel]}**`
            ].join('\n'), true)
            .addField('❯ Users', [
                `• Online/Offline users: **${online}**/**${offline}** (${Math.round((100 * online) / guild.memberCount)}% users online)`,
                `• **${newbies}** new users within the last 24h.`
            ].join('\n'), true);

        return msg.send({ embed });
    }

    async flow(msg, input = msg.channel) {
        if (await msg.hasLevel(1) !== true) throw 'you require to be at least a Staff Member to run this command.';
        const channel = await this.client.handler.search.channel(input, msg);

        if (!channel.readable) throw `I am sorry, but I need the permission **VIEW CHANNEL** in the channel ${channel}.`;
        const messages = await channel.fetchMessages({ limit: 100 });
        const amount = messages.filter(mes => mes.createdTimestamp > msg.createdTimestamp - 60000).size;
        return msg.send(`Dear ${msg.author}, ${amount} messages have been sent within the last minute.`);
    }

    perms(...args) {
        return this.permissions(...args);
    }

    async permissions(msg, input) {
        if (await msg.hasLevel(2) !== true) throw 'you require to be at least a Moderator Member to run this command.';
        const user = await this.client.handler.search.user(input, msg);
        const member = await msg.guild.fetchMember(user).catch(() => null);
        if (!member) throw 'This user is not in this guild.';

        const { permissions } = member;
        const perm = ['\u200B'];
        for (let i = 0; i < PermissionFlags.length; i++) {
            perm.push(`${permissions.has(PermissionFlags[i]) ? '\\🔹' : '\\🔸'} ${util.toTitleCase(PermissionFlags[i].replace(/_/g, ' '))}`);
        }

        const embed = new MessageEmbed()
            .setColor(msg.guild.members.get(member.user.id).highestRole.color || 0xdfdfdf)
            .setTitle(`Permissions for ${member.user.tag} (${member.user.id})`)
            .setDescription(perm);

        return msg.send({ embed });
    }

    async invite(msg, input) {
        if (await msg.hasLevel(2) !== true) throw 'you require to be at least a Moderator Member to run this command.';
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

    resolvePermissions(perm, type) {
        const output = [''];
        for (let i = 0; i < PermissionFlags.length; i++) {
            if (perm.has(PermissionFlags[i])) output.push(`\u200B    ${type === '+' ? '\\🔹' : '\\🔸'} ${util.toTitleCase(PermissionFlags[i].replace(/_/g, ' '))}`);
        }
        return output.join('\n');
    }

};
