const { Inhibitor } = require('../index');

module.exports = class extends Inhibitor {

	async run(msg, cmd) {
		if (cmd.enabled
			&& msg.guild
			&& msg.guild.configs.disabledChannels.length > 0
			&& msg.guild.configs.disabledChannels.includes(msg.channel.id)
			&& !await msg.hasAtLeastPermissionLevel(6))
			throw true;
	}

};
