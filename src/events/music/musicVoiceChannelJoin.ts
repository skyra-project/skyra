import { Queue } from '#lib/audio';
import { AudioEvent } from '#lib/structures/AudioEvent';
import { OutgoingWebsocketAction } from '#lib/websocket/types';
import { VoiceChannel } from 'discord.js';

export default class extends AudioEvent {
	public async run(queue: Queue, voiceChannel: VoiceChannel) {
		if (await queue.getSystemPaused()) {
			if (voiceChannel.listeners.length > 0) await queue.resume();
		} else if (voiceChannel.listeners.length === 0) {
			await queue.pause({ system: true });
		}

		return this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebsocketAction.MusicVoiceChannelJoin,
			data: { voiceChannel: voiceChannel.id }
		}));
	}
}
