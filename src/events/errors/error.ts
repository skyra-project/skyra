import { Event, LogLevel } from 'klasa';

export default class extends Event {
	public run(message: string) {
		this.context.client.logger.error(message);
	}

	public async onLoad() {
		if (!((this.context.client.logger.level ?? 0) <= LogLevel.Error)) await this.unload();
	}
}
