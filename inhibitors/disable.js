const { Inhibitor } = require('../index');

module.exports = class extends Inhibitor {

    async run(msg, cmd) {
        if (cmd.enabled || msg.channel.type !== 'text' || !msg.guild.settings.disabledCommands.includes(cmd.help.name)) return;
        throw msg.language.get('INHIBITOR_DISABLED');
    }

};
