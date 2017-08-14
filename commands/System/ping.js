const { Command } = require('../../index');

/* eslint-disable class-methods-use-this */
module.exports = class Ping extends Command {

    constructor(...args) {
        super(...args, {
            mode: 2,

            description: 'Runs a connection test to Discord.'
        });
    }

    async run(msg) {
        return msg.send('Ping?')
            .then(mes => mes.edit(`Pong! (Roundtrip took: ${mes.createdTimestamp - msg.createdTimestamp}ms. Heartbeat: ${Math.round(this.client.ping)}ms.)`));
    }

};
