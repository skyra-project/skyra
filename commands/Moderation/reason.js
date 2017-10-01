const { Command, util, ModLog } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            name: 'reason',
            permLevel: 2,
            guildOnly: true,
            cooldown: 5,

            description: 'Edit the reason field from a case.',
            usage: '<case:integer> <reason:string> [...]',
            usageDelim: ' '
        });
    }

    async run(msg, [selected, ...reason], settings, i18n) {
        reason = reason.length > 0 ? reason.join(' ') : null;

        if (!settings.channels.modlog) throw i18n.get('GUILD_SETTINGS_CHANNELS_MOD');
        const channel = msg.guild.channels.get(settings.channels.modlog);
        if (!channel) {
            await settings.update({ channels: { mod: null } });
            throw i18n.get('GUILD_SETTINGS_CHANNELS_MOD');
        }

        const log = await settings.moderation.getCases(selected).catch(() => null);
        if (!log) throw i18n.get('COMMAND_REASON_NOT_EXISTS');

        await settings.moderation.updateCase(selected, { reason });

        const messages = await channel.messages.fetch({ limit: 100 });

        const regCase = new RegExp(`(AUTO | )?Case ${selected}`);

        const message = messages.find(mes => mes.author.id === this.client.user.id
            && mes.embeds.length > 0
            && mes.embeds[0].type === 'rich'
            && mes.embeds[0].footer && regCase.test(mes.embeds[0].footer.text)
        );

        if (message) {
            const embed = message.embeds[0];
            const [type, user] = embed.description.split('\n');
            embed.description = [
                type,
                user,
                `**Reason**: ${reason}`
            ].join('\n');
            embed.author = {
                name: msg.author.tag,
                iconURL: msg.author.displayAvatarURL({ size: 128 })
            };
            await message.edit({ embed });
        } else {
            const dataColor = ModLog.getColor(log.type);
            const user = await this.client.users.fetch(log.user).catch(() => ({ tag: 'Unknown', id: log.user }));
            const embed = new MessageEmbed()
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ size: 128 }))
                .setColor(dataColor.color)
                .setDescription([
                    `**Type**: ${dataColor.title}`,
                    `**User**: ${user.tag} (${user.id})`,
                    `**Reason**: ${reason}`
                ])
                .setFooter(`Case ${selected}`)
                .setTimestamp();
            await channel.send({ embed });
        }

        const oldReason = log.reason;

        return msg.alert(`Successfully updated the log ${selected}.${util.codeBlock('http', [
            `Old reason : ${oldReason || 'Not set.'}`,
            `New reason : ${reason}`
        ].join('\n'))}`);
    }

};
