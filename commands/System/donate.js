const { Command } = require('../../index');

const content = Command.joinLines`
    Skyra Project started on 24th October 2016, if you are reading this, you are
    using the version 1.10.0 (ThunderLight Update), which is the tenth rewrite. I have
    improved a lot every single function from Skyra, and now, she is extremely fast.

    However, not everything is free, I need your help to keep Skyra alive in a VPS so
    you can enjoy her functions longer. I will be very thankful if you help me, really,
    I have been working on a lot of things, but she is my beautiful baby, take care of her ❤

    Do you want to support this amazing project? Feel free to do so! paypal.me/kyranet
`;

/* eslint-disable class-methods-use-this */
module.exports = class Donate extends Command {

    constructor(...args) {
        super(...args, {
            mode: 2,

            description: 'Donate for Skyra Project.',
            extendedHelp: content
        });
    }

    async run(msg) {
        return Command.sendDM(msg, content);
    }

};
