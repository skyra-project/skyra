import { Event } from 'klasa';
import { VoiceState } from 'discord.js';

export default class extends Event {

	public async run(_oldState: VoiceState, newState: VoiceState) {
		const { music } = newState.guild;
		const { voiceChannel } = music;

		// If there was no voice channel, ignore the update.
		if (!voiceChannel) return;

		// If the new state is not in the music voice channel
		if (newState.channel !== voiceChannel && music.playing) {
			if (music.listeners.length === 0) await music.pause(true);
		} else if (newState.channel === voiceChannel && music.paused && music.systemPaused) {
			if (music.listeners.length !== 0) await music.resume();
		}
	}

}
