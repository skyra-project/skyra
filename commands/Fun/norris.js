const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['chucknorris'],
            spam: true,

            cooldown: 10,

            description: 'Enjoy your time reading Chuck Norris\' jokes.',
            extendedHelp: Command.strip`
                What does Chuck Norris say?

                = Usage =
                Skyra, chucknorris

                = Example =
                Skyra, chucknorris
                    Chuck Norris roundhouse-kicked the acting ability out of Vin Diesel.
            `
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
