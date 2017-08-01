const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class Ping extends Command {

    constructor(...args) {
        super(...args, 'ping', {
            mode: 2,

            description: 'Runs a connection test to Discord.'
        });
    }

    async run(msg) {
        return msg.send('Ping?')
            .then(m => m.edit(`Pong! (Roundtrip took: ${m.createdTimestamp - msg.createdTimestamp}ms. Heartbeat: ${Math.round(this.client.ping)}ms.)`));
    }

};
