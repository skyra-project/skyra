const { Command, util: { exec } } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['execute'],
            permLevel: 10,
            mode: 2,

            usage: '<expression:string>',
            description: 'Execute Order 66.'
        });
    }

    async run(msg, [input]) {
        const result = await exec(input);

        const output = result.stdout ? `**\`OUTPUT\`**${'```sh'}\n${result.stdout}\n${'```'}` : '';
        const outerr = result.stderr ? `**\`ERROR\`**${'```sh'}\n${result.stderr}\n${'```'}` : '';
        return msg.send([output, outerr].join('\n'));
    }

};
