import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { floatPromise } from '@utils/util';
import { Event } from 'klasa';

export default class extends Event {
	public run(manager: MusicHandler, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(this, channel.sendLocale('commandJoinFailed'));
		}
	}
}
