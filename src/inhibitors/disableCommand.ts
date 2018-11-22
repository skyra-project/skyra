import { Inhibitor } from '../index';

export default class extends Inhibitor {

	async run(msg, cmd) {
		if (cmd.enabled
			&& msg.guild
			&& (msg.guild.settings.disabledChannels.includes(msg.channel.id) || this.isChannelInhibited(msg, cmd))
			&& !await msg.hasAtLeastPermissionLevel(5))
			throw true;
	}

	isChannelInhibited(msg, cmd) {
		const entry = msg.guild.settings.disabledCommandsChannels[msg.channel.id];
		return entry ? entry.includes(cmd.name) : false;
	}

};
