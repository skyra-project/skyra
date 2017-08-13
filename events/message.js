const { Event } = require('../index');

module.exports = class extends Event {

    async run(msg) {
        if (this.client.ready) {
            let settings = msg.guildSettings;
            if (settings instanceof Promise) settings = await settings;
            this.client.monitors.run(msg, settings);
        }
    }

};
