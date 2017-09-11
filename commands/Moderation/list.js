const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 2,
            botPerms: ['EMBED_LINKS'],
            mode: 2,
            cooldown: 5,

            usage: '<channels|roles|members|warnings> [input:string] [...]',
            usageDelim: ' ',
            description: 'Check all channels from this server.'
        });
    }

    async run(msg, [type, ...input], settings) {
        input = input.length ? input.join(' ') : null;
        const embed = new MessageEmbed()
            .setColor(msg.member.highestRole.color || 0xdfdfdf)
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
                .map(channel => `❯ **${channel.name}** **\`${channel.toString()}\`**`)
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
                .map(role => `❯ **\`${String(role.members.size).padStart(3, '_')}\`** ${role.name} (${role.id})`)
                .join('\n')
            );
    }

    async members(msg, embed, input) {
        const role = await this.client.handler.search.role(input, msg);
        if (!role) throw 'you must specify a role.';
        if (!role.members.size) throw 'this role has no members.';

        return embed
            .setTitle(msg.language.get('COMMAND_LIST_MEMBERS', role.name, role.id))
            .splitFields(role.members
                .map(member => `\`${member.id}\` ❯ ${member.user.tag}`)
                .join('\n')
            );
    }

    async warnings(msg, embed, input, settings) {
        const cases = await settings.moderation.getCases().then(cs => cs.filter(rl => rl.type === 'warn'));
        if (!input) {
            return embed
                .setTitle(msg.language.get('COMMAND_LIST_STRIKES', false))
                .splitFields(`${!cases.length ? "There's no strike." : `There are ${cases.length} strikes. Cases: **${cases
                    .map(rl => rl.case)
                    .join('**, **')}**`}`
                );
        }
        const user = await this.client.handler.search.user(input, msg);
        const thisStrikes = cases.filter(ncase => ncase.user === user.id);

        const output = [];

        if (thisStrikes.length === 0) output.push(`There's no strike for ${user.tag}.`);
        else {
            output.push(`There are ${thisStrikes.length} strike(s):\n`);

            for (const ncase of thisStrikes) {
                const moderator = await this.client.fetchUser(ncase.moderator);
                output.push(`Case \`${ncase.case}\`. Moderator: **${moderator.tag}**\n\`${ncase.reason || `Not set. Use ${settings.master.prefix}reason ${ncase.case} to claim this case.`}\`\n`);
            }
        }

        return embed
            .setTitle(msg.language.get('COMMAND_LIST_STRIKES', user.tag))
            .setDescription(output);
    }

};
