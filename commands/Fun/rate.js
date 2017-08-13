const { Command } = require('../../index');
const { oneToTen } = require('../../utils/constants');

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, 'rate', {
            spam: true,

            usage: '<user:string>',
            description: 'Let bots have opinions and rate somebody.',
            extendedHelp: Command.strip`
                Hey! Do you want to know what I'd rate something?

                = Usage =
                Skyra, rate <User>
                User :: The user to rate.

                = Example =
                Skyra, rate Microsoft
            `
        });
    }

    async run(msg, [user]) {
        let ratewaifu;
        let rate;

        const i18n = msg.language;

        if (/^(you|yourself)$/i.test(user)) {
            rate = 100;
            [ratewaifu, user] = i18n.get('COMMAND_RATE_MYSELF');
        } else {
            if (/^(myself|me)$/i.test(user)) user = msg.author.username;
            else user = user.replace(/\bmy\b/g, 'your');

            const bg = Buffer.from(user.toLowerCase()).readUIntBE(0, user.length);
            const rng = user.length * Math.abs(Math.sin(bg)) * 10;
            rate = 100 - Math.round((bg * rng) % 100);
            ratewaifu = oneToTen(Math.floor(rate / 10)).emoji;
        }

        return msg.send(`**${msg.author.username}**, ${i18n.get('COMMAND_RATE', user, rate, ratewaifu)}`);
    }

};
