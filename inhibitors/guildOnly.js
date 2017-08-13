const { Inhibitor } = require('../index');

module.exports = class extends Inhibitor {

    async run(msg, cmd) {
        if (cmd.conf.guildOnly && msg.channel.type !== 'text') throw msg.language.get('INHIBITOR_GUILDONLY');
        return;
    }

};
