const { Event } = require('../index');

module.exports = class extends Event {

    run() {
        this.client.user.setGame('Skyra, help').catch(err => this.client.emit('log', err, 'error'));
    }

};
