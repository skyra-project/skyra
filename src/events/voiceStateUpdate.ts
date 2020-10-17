import { Events } from '@lib/types/Enums';
import { CLIENT_ID } from '@root/config';
import { VoiceState } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public async run(oldState: VoiceState, newState: VoiceState) {
		const { audio } = newState.guild;

		if (newState.id === CLIENT_ID) {
			// If both channels were the same, skip
			if (oldState.channelID === newState.channelID) return;

			if (newState.channel === null) {
				this.client.emit(Events.MusicVoiceChannelLeave, audio, oldState.channel);
			} else {
				this.client.emit(Events.MusicVoiceChannelJoin, audio, newState.channel);
			}
		} else if (audio.voiceChannelID) {
			if (audio.playing) {
				if (audio.listeners.length === 0) await audio.pause(true);
			} else if (audio.paused && audio.systemPaused) {
				if (audio.listeners.length !== 0) await audio.resume();
			}
		}
	}
}
