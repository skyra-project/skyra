const { Event } = require('../index');

module.exports = class extends Event {

    run(msg) {
        for (const [key, value] of this.client.commandMessages) {
            if (key === msg.id) return this.client.commandMessages.delete(key);
            if (msg.id === value.response.id) return this.client.commandMessages.delete(key);
        }
        return false;
    }

};
