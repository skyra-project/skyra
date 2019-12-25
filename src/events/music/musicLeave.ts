import { Event } from 'klasa';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';
import { VoiceChannel } from 'discord.js';
import { floatPromise } from '../../lib/util/util';

export default class extends Event {

	public run(manager: MusicHandler, voiceChannel: VoiceChannel) {
		const { channel } = manager;

		if (channel) {
			floatPromise(this, channel.sendLocale('COMMAND_LEAVE_SUCCESS', [voiceChannel]));
		}

		manager.channelID = null;
		manager.reset(true);
		manager.systemPaused = false;

		// TODO (Favna | Magna): Add WS handler
	}

}
