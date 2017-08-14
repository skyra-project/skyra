const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 2,
            botPerms: ['EMBED_LINKS'],
            mode: 2,

            usage: '<channels|roles|members|invites|warnings|track|advertising> [input:string] [...]',
            usageDelim: ' ',
            description: 'Check all channels from this server.'
        });
    }

    async run(msg, [type, ...input], settings) {
        input = input.length ? input.join(' ') : null;
        const embed = new MessageEmbed()
            .setColor(this.msg.member.highestRole.color || 0xdfdfdf)
            .setFooter(this.client.user.username, this.client.user.displayAvatarURL({ size: 128 }))
            .setTimestamp();

        const reply = await this[type](msg, embed, input, settings);

        return msg.send(reply instanceof MessageEmbed ? { embed: reply } : reply);
    }

    async channels(msg, embed) {
        return embed
            .setTitle(msg.language.get('COMMAND_LIST_CHANNELS', msg.guild.name, msg.guild.id))
            .splitFields(msg.guild.channels
                .sort((x, y) => +(x.position > y.position) || +(x.position === y.position) - 1)
                .map(channel => ` ❯ **${channel.name}** **\`${channel.toString()}\`**`)
                .join('\n')
            );
    }

    async roles(msg, embed) {
        return embed
            .setTitle(msg.language.get('COMMAND_LIST_ROLES', msg.guild.name, msg.guild.id))
            .splitFields(Array.from(msg.guild.roles.values())
                .sort((x, y) => +(x.position > y.position) || +(x.position === y.position) - 1)
                .slice(1)
                .reverse()
                .map(role => ` ❯ **\`${String(role.members.size).padStart(3, '_')}\`** ${role.name} (${role.id})`)
                .join('\n')
            );
    }

    async members(msg, embed, input) {
        const role = await this.client.handler.search.role(input, msg);
        if (!role.members.size) throw 'this role has no members.';

        return embed
            .setTitle(msg.language.get('COMMAND_LIST_MEMBERS', role.name, role.id))
            .splitFields(role.members
                .map(member => `\`${member.id}\` ❯ ${member.user.tag}`)
                .join('\n')
            );
    }

    async invites(msg, embed) {
        if (!msg.guild.me.hasPermission('MANAGE_GUILD')) throw 'I am sorry, but I need the permission MANAGE_GUILD to show you this.';

        const invites = await msg.guild.fetchInvites();
        if (!invites.first()) return msg.alert("There's no invite link here.");
        return embed
            .setTitle(msg.language.get('COMMAND_LIST_INVITES', msg.guild.name, msg.guild.id))
            .splitFields(invites
                .sort((x, y) => +(x.uses > y.uses) || +(x.uses === y.uses) - 1)
                .map(inv => `🔻 ${inv.channel} ❯ ${inv.inviter}\n      ❯ \`${inv.code}\` Uses: (${inv.uses})`)
                .join('\n')
            );
    }

    async warnings(msg, embed, input, settings) {
        const cases = await settings.moderation.getCases().then(cs => cs.filter(rl => rl.type === 'warn'));
        if (!input) {
            return embed
                .setTitle(msg.language.get('COMMAND_LIST_STRIKES', false))
                .splitFields(`${!cases.length ? "There's no strike." : `There are ${cases.length} strikes. Cases: **${cases
                    .map(rl => rl.thisCase)
                    .join('**, **')}**`}`
                );
        }
        const user = await this.client.handler.search.user(input, msg);
        const thisStrikes = cases.filter(ncase => ncase.user.id === user.id);

        return embed
            .setTitle(msg.language.get('COMMAND_LIST_STRIKES', user.tag))
            .setDescription(`${!thisStrikes.length ? `There's no strike for ${user.tag}.` : `There are ${thisStrikes.length} strike(s):\n\n${thisStrikes
                .map(ncase => `Case \`${ncase.thisCase}\`. Moderator: **${ncase.moderator.tag}**\n\`${ncase.reason}\``)
                .join('\n\n')}`}`);
    }

    async track(msg, embed) {
        const i18n = msg.language;
        const output = [];

        for (const channel of msg.guild.channels.values()) {
            if (!channel.tracker) continue;
            output.push([
                moment.duration(msg.createdAt - channel.trackertimer).format('m [mins], s [secs]'),
                i18n.get('COMMAND_LIST_TRACKERS_BY', channel, msg.guild.members.get(channel.tracker))
            ].join('\n'));
        }

        if (output.length === 0) return i18n.get('COMMAND_LIST_TRACKERS_NONE');

        return embed
            .setTitle(i18n.get('COMMAND_LIST_TRACKERS', output.length))
            .splitFields(output.join('\n'));
    }

    async advertising(msg, embed) {
        if ((msg.guild.members.size / msg.guild.memberCount) * 100 < 90) {
            await msg.send(msg.language.get('SYSTEM_FETCHING'));
            await msg.guild.fetchMembers();
        }
        const members = msg.guild.members.filter(member => member.user.presence.game && /(discord\.(gg|io|me|li)\/.+|discordapp\.com\/invite\/.+)/i.test(member.user.presence.game.name));
        if (!members.size) return msg.language.get('COMMAND_LIST_ADVERTISEMENT_EMPTY');
        return embed
            .setTitle(msg.language.get('COMMAND_LIST_ADVERTISEMENT'))
            .splitFields(members
                .map(member => `${member.toString()} ${member.displayName} || ${member.user.presence.game.name}`)
                .join('\n')
            );
    }

};
