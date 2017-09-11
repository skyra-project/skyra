const { Event } = require('../index');

module.exports = class extends Event {

    run(error) {
        return this.client.console.log(error, 'error');
    }

};
