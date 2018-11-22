import { IPCMonitor, ToJSON } from '../../index';

export default class extends IPCMonitor {

	run({ guildID }) {
		return (guild => guild ? guild.roles.map(ToJSON.role) : null)(this.client.guilds.get(guildID));
	}

};
