const { Command } = require('../../../index');
const ModLog = require('../../../utils/createModlog.js');

/* eslint-disable class-methods-use-this */
module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            guildOnly: true,
            permLevel: 2,
            botPerms: ['EMBED_LINKS'],
            mode: 2,

            usage: '<Case:integer>',
            description: 'Get the information from a case by its index.'
        });
    }

    async run(msg, [index], settings) {
        const cases = await settings.moderation.getCases();

        if (!cases[index]) throw 'this case does not seem to exist.';
        return new ModLog(msg.guild)
            .retrieveModLog(index).then(embed => msg.send({ embed }));
    }

};
