const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['kittenfact'],
            spam: true,

            cooldown: 10,

            description: 'Let me tell you a misterious cat fact.'
        });
    }

    async run(msg, args, settings, i18n) {
        const data = await this.fetchURL('https://catfact.ninja/fact');
        const embed = new MessageEmbed()
            .setColor(0xFFE0B2)
            .setTitle(i18n.get('COMMAND_CATFACT'))
            .setDescription(data.fact);

        return msg.send({ embed });
    }

    fetchURL(url) {
        return snekfetch.get(url)
            .then(data => JSON.parse(data.text))
            .catch(Command.handleError);
    }

};
