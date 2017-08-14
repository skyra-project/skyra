const { Command, util } = require('../../index');
const ModLog = require('../../utils/createModlog.js');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            name: 'reason',
            permLevel: 2,
            guildOnly: true,

            description: 'Edit the reason field from a case.',
            usage: '<case:integer> <reason:string> [...]',
            usageDelim: ' '
        });
    }

    async run(msg, [selected, ...reason], settings) {
        reason = reason.length > 0 ? reason.join(' ') : null;

        if (!settings.channels.mod) throw msg.language.get('GUILD_SETTINGS_CHANNELS_MOD');
        const channel = msg.guild.channels.get(settings.channels.mod);
        if (!channel) {
            await settings.update({ channels: { mod: null } });
            throw msg.language.get('GUILD_SETTINGS_CHANNELS_MOD');
        }

        const log = await settings.moderation.getCases(selected);
        if (!log) throw msg.language.get('COMMAND_REASON_NOT_EXISTS');

        const messages = await channel.fetchMessages({ limit: 100 });
        const message = messages.find(mes => mes.author.id === this.client.user.id &&
            mes.embeds.length > 0 &&
            mes.embeds[0].type === 'rich' &&
            mes.embeds[0].footer && mes.embeds[0].footer.text === `Case ${selected}`
        );

        if (message) {
            const embed = message.embeds[0];
            const [type, user] = embed.description.split('\n');
            embed.description = [
                type,
                user,
                `**Reason**: ${reason}`
            ].join('\n');
            await message.edit({ embed });
        } else {
            const dataColor = ModLog.getColor(log.type);
            const embed = new MessageEmbed()
                .setAuthor(log.moderator.tag)
                .setColor(dataColor.color)
                .setDescription([
                    `**Type**: ${dataColor.title}`,
                    `**User**: ${log.user.tag} (${log.user.id})`,
                    `**Reason**: ${reason}`
                ])
                .setFooter(`Case ${selected}`)
                .setTimestamp();
            await channel.send({ embed });
        }

        const oldReason = log.reason;

        return msg.send(`Successfully updated the log ${selected}.${util.codeBlock('http', [
            `Old reason : ${oldReason || 'Not set.'}`,
            `New reason : ${reason}`
        ].join('\n'))}`);
    }

};
