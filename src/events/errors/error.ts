import { Event, Logger, LogLevel } from '@sapphire/framework';

export class UserEvent extends Event {
	public run(message: string) {
		this.context.client.logger.error(message);
	}

	public async onLoad() {
		if ((this.context.client.logger as Logger).level > LogLevel.Error) await this.unload();
		return super.onLoad();
	}
}
