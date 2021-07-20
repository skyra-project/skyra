import { envParseBoolean } from '#lib/env';
import { MemberHandler, YoutubeSubscriptionHandler } from './structures';

export class ModelStore {
	public readonly members = new MemberHandler();
	public readonly youtubeSubscriptions = new YoutubeSubscriptionHandler();

	public async start() {
		if (!envParseBoolean('GRPC_ENABLED')) return this.destroy();

		const promises = [];
		if (envParseBoolean('GRPC_SOCIAL_ENABLED')) promises.push(this.members.waitForReady());
		if (envParseBoolean('GRPC_YOUTUBE_ENABLED')) promises.push(this.youtubeSubscriptions.waitForReady());
		if (promises.length) await Promise.all(promises);
	}

	public destroy() {
		this.members.client.close();
		this.youtubeSubscriptions.client.close();
	}
}
