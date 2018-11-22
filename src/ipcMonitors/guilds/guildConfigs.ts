import { IPCMonitor } from '../../index';

export default class extends IPCMonitor {

	run({ guildID }) {
		return (guild => guild ? guild.settings.toJSON() : null)(this.client.guilds.get(guildID));
	}

};
