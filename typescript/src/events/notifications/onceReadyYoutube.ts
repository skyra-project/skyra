import { Events } from '#lib/types/Enums';
import { enabled } from '#utils/youtube';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ once: true, enabled, event: Events.Ready })
export class UserEvent extends Event<Events.Ready> {
	public async run() {
		while (this.context.grpc.youtubeSubscriptions.available) {
			await this.startListener();
		}
	}

	private async startListener() {
		try {
			for await (const value of this.context.grpc.youtubeSubscriptions.subscriptionNotifications()) {
				this.context.client.emit(Events.YoutubeNotification, value);
			}
		} catch (error) {
			this.context.logger.fatal(error);
		} finally {
			this.context.logger.info('Youtube Notification stream finished.');
		}
	}
}
