import { AudioEvent, OutgoingWebSocketAction, Queue } from '#lib/audio';
import { getListenerCount } from '#utils/functions';
import type { VoiceChannel } from 'discord.js';

export class UserAudioEvent extends AudioEvent {
	public async run(queue: Queue, voiceChannel: VoiceChannel) {
		if (await queue.getSystemPaused()) {
			if (getListenerCount(voiceChannel) > 0) await queue.resume();
		} else if (getListenerCount(voiceChannel) === 0) {
			await queue.pause({ system: true });
		}

		return this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebSocketAction.MusicVoiceChannelJoin,
			data: { voiceChannel: voiceChannel.id }
		}));
	}
}
