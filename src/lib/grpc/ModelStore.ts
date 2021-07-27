import { envParseBoolean } from '#lib/env';
import { MemberHandler } from './structures';

export class ModelStore {
	public readonly members = new MemberHandler();

	public async start() {
		if (!envParseBoolean('GRPC_ENABLED')) return this.destroy();

		await this.members.waitForReady();
	}

	public destroy() {
		this.members.client.close();
	}
}
