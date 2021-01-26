import { Events } from '#lib/types/Enums';
import { CLIENT_ID } from '#root/config';
import { Event } from '@sapphire/framework';
import type { VoiceState } from 'discord.js';

export default class extends Event {
	public async run(oldState: VoiceState, newState: VoiceState) {
		const { audio } = newState.guild;

		if (newState.id === CLIENT_ID) {
			// If both channels were the same, skip
			if (oldState.channelID === newState.channelID) return;

			if (newState.channel === null) {
				this.context.client.emit(Events.MusicVoiceChannelLeave, audio, oldState.channel);
			} else {
				this.context.client.emit(Events.MusicVoiceChannelJoin, audio, newState.channel);
			}
		} else if (audio.voiceChannelID) {
			if (audio.playing) {
				if (audio.voiceChannel?.listeners.length === 0) await audio.pause({ system: true });
			} else if (await audio.getSystemPaused()) {
				if (audio.voiceChannel?.listeners.length !== 0) await audio.resume();
			}
		}
	}
}
