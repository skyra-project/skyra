import { Queue } from '@lib/audio';
import { AudioEvent } from '@lib/structures/AudioEvent';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { VoiceChannel } from 'discord.js';

export default class extends AudioEvent {
	public async run(queue: Queue, voiceChannel: VoiceChannel) {
		if (await queue.systemPaused()) {
			if (voiceChannel.listeners.length > 0) await queue.resume();
		} else if (voiceChannel.listeners.length === 0) {
			await queue.pause({ system: true });
		}

		for (const subscription of this.getWebSocketListenersFor(queue.guildID)) {
			subscription.send({ action: OutgoingWebsocketAction.MusicVoiceChannelJoin, data: { voiceChannel: voiceChannel.id } });
		}
	}
}
