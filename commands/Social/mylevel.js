const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            mode: 1,
            spam: true,
            cooldown: 30,

            description: 'Check your local level.'
        });
    }

    async run(msg, args, settings) {
        const memberPoints = msg.member.points.score;
        const nextRole = this.getLatestRole(memberPoints, settings.autoroles);
        const title = nextRole ? `\n${msg.language.get('COMMAND_SOCIAL_MYLEVEL_NEXT', nextRole.points - memberPoints, nextRole.points)}` : '';
        return msg.send(msg.language.get('COMMAND_SOCIAL_MYLEVEL', memberPoints, title));
    }

    getLatestRole(points, autoroles) {
        if (autoroles.length === 0) return null;

        for (let i = 0; i < autoroles.length; i++) {
            if (autoroles[i].points > points) return autoroles[i];
        }

        return null;
    }

};
