import { Event } from 'klasa';
import { MusicHandler, MusicHandlerRequestContext } from '../../lib/structures/music/MusicHandler';
import { VoiceChannel } from 'discord.js';
import { floatPromise } from '../../lib/util/util';

export default class extends Event {

	public run(manager: MusicHandler, voiceChannel: VoiceChannel, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(this, channel.sendLocale('COMMAND_JOIN_SUCCESS', [voiceChannel]));
		}

		// TODO (Favna | Magna): Add WS handler
	}

}
