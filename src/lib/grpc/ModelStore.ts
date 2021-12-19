import { envParseBoolean } from '#lib/env';
import { CdnServiceHandler, YoutubeServiceHandler } from './structures';

export class ModelStore {
	public readonly cdn = new CdnServiceHandler();
	public readonly youtube = new YoutubeServiceHandler();

	public async start() {
		const promises: Promise<void>[] = [];

		if (envParseBoolean('GRPC_CDN_ENABLED')) promises.push(this.cdn.waitForReady());
		if (envParseBoolean('GRPC_NOTIFICATIONS_ENABLED')) promises.push(this.youtube.waitForReady());

		await Promise.all(promises);
	}

	public destroy() {
		this.cdn.dispose();
		this.youtube.dispose();
	}
}
