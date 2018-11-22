import { IPCMonitor, ToJSON } from '../../index';

export default class extends IPCMonitor {

	run({ guildID }) {
		return (guild => guild ? guild.channels.map(ToJSON.channel) : null)(this.client.guilds.get(guildID));
	}

};
