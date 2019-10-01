import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public run({ guildID }: { guildID: string }) {
		return (guild => guild ? guild!.channels.map(channel => channel.toJSON()) : null)(this.client.guilds.get(guildID));
	}

}
