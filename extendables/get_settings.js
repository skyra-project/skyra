const { Extendable } = require('../index');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['Guild'], { name: 'settings' });
    }

    get extend() {
        return this.client.handler.guilds.get(this.id);
    }

};
