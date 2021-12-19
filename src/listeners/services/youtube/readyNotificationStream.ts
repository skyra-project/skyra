import { envParseBoolean } from '#lib/env';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({ event: 'ready', once: true, enabled: envParseBoolean('GRPC_ENABLED') && envParseBoolean('GRPC_YOUTUBE_ENABLED') })
export class UserListener extends Listener {
	public async run() {
		const { client, grpc } = this.container;

		for await (const notification of grpc.youtube.getNotificationStream()) {
			client.emit(Events.YoutubeNotification, notification);
		}
	}
}
