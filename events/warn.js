const { Event } = require('../index');

module.exports = class extends Event {

    run(info) {
        return this.client.console.log(info, 'warn');
    }

};
