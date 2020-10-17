import { Queue } from '@lib/audio';
import { Guild, TextChannel } from 'discord.js';
import { Event } from 'klasa';

export abstract class AudioEvent extends Event {
	public getGuildFor(queue: Queue): Guild | null {
		return this.client.guilds.cache.get(queue.guildID) ?? null;
	}

	public async getTextChannelFor(queue: Queue): Promise<TextChannel | null> {
		const guild = this.getGuildFor(queue);
		if (guild === null) return null;

		const channelID = await queue.textChannelID();
		if (channelID === null) return null;

		const channel = guild.channels.cache.get(channelID) ?? null;
		if (channel === null) {
			await queue.textChannelID(null);
			return null;
		}

		return channel as TextChannel;
	}

	public *getWebSocketListenersFor(guildID: string) {
		for (const user of this.client.websocket.users.values()) {
			if (user.musicSubscriptions.subscribed(guildID)) yield user;
		}
	}
}
