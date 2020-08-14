import { MusicHandler } from '@lib/structures/music/MusicHandler';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { VoiceChannel } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public async run(manager: MusicHandler, voiceChannel: VoiceChannel) {
		if (manager.systemPaused) {
			if (manager.listeners.length > 0) await manager.resume();
		} else if (manager.listeners.length === 0) {
			await manager.pause(true);
		}

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicVoiceChannelJoin, data: { voiceChannel: voiceChannel.id } });
		}
	}
}
