import { IPCMonitor, ToJSON } from '../../index';

export default class extends IPCMonitor {

	run({ guildID }) {
		return (guild => guild ? guild.members.map(ToJSON.guildMember) : null)(this.client.guilds.get(guildID));
	}

};
