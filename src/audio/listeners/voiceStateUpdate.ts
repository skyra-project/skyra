import { AudioListener } from '#lib/audio';
import { Events } from '#lib/types/Enums';
import { getListenerCount } from '#utils/functions';
import type { VoiceState } from 'discord.js';

export class UserAudioListener extends AudioListener {
	public async run(oldState: VoiceState, newState: VoiceState) {
		const { audio } = newState.guild;

		if (newState.id === process.env.CLIENT_ID) {
			// If both channels were the same, skip
			if (oldState.channelId === newState.channelId) return;

			if (newState.channel === null) {
				this.container.client.emit(Events.MusicVoiceChannelLeave, audio, oldState.channel);
			} else {
				this.container.client.emit(Events.MusicVoiceChannelJoin, audio, newState.channel);
			}
		} else if (audio.voiceChannelId) {
			if (audio.playing) {
				if (getListenerCount(audio.voiceChannel) === 0) await audio.pause({ system: true });
			} else if (await audio.getSystemPaused()) {
				if (getListenerCount(audio.voiceChannel) !== 0) await audio.resume();
			}
		}
	}
}
