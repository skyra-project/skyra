import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run({ guildID, channelID }: any) {
		const guild = this.client.guilds.get(guildID);
		if (guild) {
			const channel = guild.channels.get(channelID);
			if (channel) return channel.toJSON();
		}
		return null;
	}

}
