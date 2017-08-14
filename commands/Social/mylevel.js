const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class MyLevel extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            mode: 1,
            spam: true,

            description: 'Check your local level.'
        });
    }

    async run(msg, args, settings) {
        let autoRole;
        const roles = settings.autoroles.length ? settings.autoroles.filter(au => au.points > msg.member.points.score) : [];
        if (roles.length) autoRole = roles.sort((a, b) => a.points > b.points ? 1 : -1)[0];
        const nextRole = autoRole ? `\nPoints for next rank: **${autoRole.points - msg.member.points.score}** (at ${autoRole.points} points).` : '';
        return msg.send(`Dear ${msg.author}, you have a total of **${msg.member.points.score}** points.${nextRole}`);
    }

};
