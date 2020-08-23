import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { floatPromise } from '@utils/util';
import { VoiceChannel } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public run(manager: MusicHandler, voiceChannel: VoiceChannel, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(this, channel.sendLocale('commandJoinSuccess', [{ channel: voiceChannel.toString() }]));
		}

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicConnect, data: { voiceChannel: voiceChannel.id } });
		}
	}
}
