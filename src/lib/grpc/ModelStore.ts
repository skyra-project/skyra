import { envParseBoolean } from '#lib/env';
import { CdnServiceHandler, YoutubeServiceHandler } from './structures';

export class ModelStore {
	public readonly cdn = new CdnServiceHandler();
	public readonly youtube = new YoutubeServiceHandler();

	public async start() {
		if (!envParseBoolean('GRPC_ENABLED')) return this.destroy();

		if (envParseBoolean('GRPC_CDN_ENABLED')) await this.cdn.waitForReady();
		if (envParseBoolean('GRPC_YOUTUBE_ENABLED')) await this.youtube.waitForReady();
	}

	public destroy() {
		this.cdn.dispose();
		this.youtube.dispose();
	}
}
