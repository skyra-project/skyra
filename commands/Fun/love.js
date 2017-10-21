const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            spam: true,
            guildOnly: true,

            cooldown: 10,

            usage: '<user:advuser>',
            description: 'Lovemeter online!',
            extend: {
                EXPLANATION: 'Hey! Wanna check the lovemeter? I know it\'s a ridiculous machine, but many humans love it! Don\'t be shy and try it!',
                ARGUMENTS: '<user>',
                EXP_USAGE: [
                    ['user', 'A user to rate.']
                ],
                EXAMPLES: ['@Skyra']
            }
        });
    }

    async run(msg, [user], settings, i18n) {
        const isSelf = msg.author.id === user.id;
        const percentage = isSelf ? 1 : Math.random();
        const estimatedPercentage = Math.ceil(percentage * 100);

        let result;
        if (estimatedPercentage < 45)
            result = i18n.get('COMMAND_LOVE_LESS45');
        else if (estimatedPercentage < 75)
            result = i18n.get('COMMAND_LOVE_LESS75');
        else if (estimatedPercentage < 100)
            result = i18n.get('COMMAND_LOVE_LESS100');
        else
            result = isSelf
                ? i18n.get('COMMAND_LOVE_ITSELF')
                : i18n.get('COMMAND_LOVE_100');

        const embed = new MessageEmbed()
            .setColor(msg.member.colorRole ? msg.member.colorRole.color : 0xE840CF)
            .setAuthor('❤ Love Meter ❤', msg.author.displayAvatarURL())
            .setThumbnail('https://twemoji.maxcdn.com/2/72x72/1f49e.png')
            .setDescription([
                `💗 **${user.tag}**`,
                `💗 **${msg.author.tag}**\n`,
                `${estimatedPercentage}% | \`\u200b${'█'.repeat(Math.round(percentage * 40)).padEnd(40)}\u200b\` |\n`,
                `**${i18n.get('COMMAND_LOVE_RESULT')}**: ${result}`
            ].join('\n'));

        return msg.send({ embed });
    }

};
