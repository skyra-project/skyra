const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            mode: 2,
            cooldown: 30,

            description: 'Runs a connection test to Discord.'
        });
    }

    async run(msg) {
        return msg.send('Ping?')
            .then(mes => mes.edit(`Pong! (Roundtrip took: ${mes.createdTimestamp - msg.createdTimestamp}ms. Heartbeat: ${Math.round(this.client.ping)}ms.)`));
    }

};
