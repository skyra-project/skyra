import { AudioEvent, OutgoingWebSocketAction, Queue } from '#lib/audio';
import type { VoiceChannel } from 'discord.js';

export class UserAudioEvent extends AudioEvent {
	public async run(queue: Queue, voiceChannel: VoiceChannel) {
		if (await queue.getSystemPaused()) {
			if (voiceChannel.listeners.length > 0) await queue.resume();
		} else if (voiceChannel.listeners.length === 0) {
			await queue.pause({ system: true });
		}

		return this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebSocketAction.MusicVoiceChannelJoin,
			data: { voiceChannel: voiceChannel.id }
		}));
	}
}
