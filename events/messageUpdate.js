const { Event } = require('../index');

module.exports = class extends Event {

    run(old, msg) {
        if (old.content !== msg.content && this.client.config.cmdEditing) this.client.emit('message', msg);
    }

};
