const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['chucknorris'],
            botPerms: ['EMBED_LINKS'],
            spam: true,

            cooldown: 10,

            description: 'Enjoy your time reading Chuck Norris\' jokes.',
            extend: {
                EXPLANATION: [
                    'Did you know that Chuck norris does **not** call the wrong number, but you **answer** the wrong phone?',
                    'Woah, mindblow. He also threw a carton of milk and created the Milky Way. This command queries chucknorris.io',
                    'and retrieves a fact (do not assume they\'re false, not in front of him) so you can read it'
                ].join(' ')
            }
        });
    }

    async run(msg, args, settings, i18n) {
        const data = await this.fetchURL('https://api.chucknorris.io/jokes/random');
        const embed = new MessageEmbed()
            .setColor(0x80D8FF)
            .setTitle(i18n.get('COMMAND_NORRIS'))
            .setURL(data.url)
            .setThumbnail(data.icon_url)
            .setDescription(data.value);

        return msg.send({ embed });
    }

    fetchURL(url) {
        return snekfetch.get(url)
            .then(data => JSON.parse(data.text))
            .catch(Command.handleError);
    }

};
