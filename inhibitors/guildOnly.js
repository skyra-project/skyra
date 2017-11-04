const { Inhibitor } = require('../index');

module.exports = class extends Inhibitor {

	async run(msg, cmd, settings, i18n) {
		if (cmd.guildOnly && msg.channel.type !== 'text') throw i18n.get('INHIBITOR_GUILDONLY');
		return;
	}

};
