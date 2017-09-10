const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['uni', 'vaporwave'],
            spam: true,

            cooldown: 10,

            usage: '<string:string>',
            description: 'Unicode characters!',
            extend: {
                EXPLANATION: [
                    ''
                ].join(' ')
            }
        });
    }

    async run(msg, [string], settings, i18n) {
        let output = '';
        for (let i = 0; i < string.length; i++) output += string[i] === ' ' ? '　' : String.fromCharCode(string.charCodeAt(i) + 0xFEE0);
        return msg.send(i18n.get('COMMAND_UNICODE', output));
    }

};
