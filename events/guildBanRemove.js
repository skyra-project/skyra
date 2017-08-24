const { Event } = require('../index');
const ModLog = require('../utils/createModlog.js');

module.exports = class extends Event {

    run(guild, user) {
        if (this.client.ready !== true || guild.settings.events.banRemove !== true) return null;
        return new ModLog(guild)
            .setAnonymous(true)
            .setUser(user)
            .setType('unban')
            .send()
            .catch(err => this.client.emit('log', err, 'error'));
    }

};
