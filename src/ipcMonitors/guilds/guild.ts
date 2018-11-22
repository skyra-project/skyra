import { IPCMonitor, ToJSON } from '../../index';

export default class extends IPCMonitor {

	run({ guildID }) {
		return (guild => guild ? ToJSON.guild(guild) : null)(this.client.guilds.get(guildID));
	}

};
