const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['chucknorris'],
            spam: true,

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

    async run(msg) {
        const data = await this.fetchURL('https://api.chucknorris.io/jokes/random');
        const embed = new MessageEmbed()
            .setColor(0x80D8FF)
            .setTitle('Chuck Norris')
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
