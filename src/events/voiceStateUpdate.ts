import { Events } from '@lib/types/Enums';
import { CLIENT_ID } from '@root/config';
import { VoiceState } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public async run(oldState: VoiceState, newState: VoiceState) {
		const { music } = newState.guild;

		if (newState.id === CLIENT_ID) {
			// If both channels were the same, skip
			if (oldState.channelID === newState.channelID) return;

			if (newState.channel === null) {
				this.client.emit(Events.MusicVoiceChannelLeave, music, oldState.channel);
			} else {
				this.client.emit(Events.MusicVoiceChannelJoin, music, newState.channel);
			}
		} else if (music.voiceChannel !== null) {
			if (music.playing) {
				if (music.listeners.length === 0) await music.pause(true);
			} else if (music.paused && music.systemPaused) {
				if (music.listeners.length !== 0) await music.resume();
			}
		}
	}
}
