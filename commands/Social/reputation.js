const { Command } = require('../../index');
const moment = require('moment');
require('moment-duration-format');

/* eslint-disable class-methods-use-this */
module.exports = class Reputation extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['rep'],
            guildOnly: true,
            mode: 1,
            spam: true,

            usage: '<user:advuser>',
            description: 'Give somebody a reputation point.',
            extendedHelp: Command.strip`
                This guy is so helpful... I'll give him a reputation point!

                = Usage =
                Skyra, rep [user]
                User :: The user to give a reputation point.

                = Reminder =
                    • You can give a reputation point once every 24 hours.
            `
        });
    }

    async run(msg, [user]) {
        const now = Date.now();

        if (msg.author.profile.timerep + 86400000 > now) {
            const remaining = (msg.author.profile.timerep + 86400000) - now;
            return msg.alert(`You can give a reputation point in ${moment.duration(remaining).format('hh [**hours**,] mm [**mins**,] ss [**secs**]')}.`, 10000);
        }
        if (msg.author.id === user.id) throw "you can't give a reputation point to yourself.";
        else if (user.bot) throw "you can't give reputation points to bots.";

        await user.profile.update({ reputation: user.profile.reputation + 1 });
        await msg.author.profile.update({ timerep: now });
        return msg.send(`Dear ${msg.author}, you have just given one reputation point to **${user.username}**`);
    }

};
