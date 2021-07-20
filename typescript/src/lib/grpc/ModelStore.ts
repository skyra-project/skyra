import { envParseBoolean } from '#lib/env';
import { MemberHandler, YoutubeSubscriptionHandler } from './structures';

export class ModelStore {
	public readonly members = new MemberHandler();
	public readonly youtubeSubscriptions = new YoutubeSubscriptionHandler();

	public async start() {
		if (!envParseBoolean('GRPC_ENABLED')) return this.destroy();

		await Promise.all([
			this.members.waitForReady(), //
			this.youtubeSubscriptions.waitForReady()
		]);
	}

	public destroy() {
		this.members.client.close();
		this.youtubeSubscriptions.client.close();
	}
}
