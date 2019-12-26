import { Event } from 'klasa';
import { MusicHandler, MusicHandlerRequestContext } from '../../lib/structures/music/MusicHandler';
import { floatPromise } from '../../lib/util/util';

export default class extends Event {

	public run(manager: MusicHandler, previous: number, next: number, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(this, channel.sendLocale('COMMAND_VOLUME_CHANGED', [
				next > previous
					? (next === 200 ? '📢' : '🔊')
					: (next === 0 ? '🔇' : '🔉'),
				next
			]));
		}

		// TODO (Favna | Magna): Add WS handler
	}

}
