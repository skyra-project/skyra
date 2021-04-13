import { envParseBoolean } from '#lib/env';
import { MemberHandler, UserHandler } from './structures';

export class ModelStore {
	public readonly members = new MemberHandler();
	public readonly users = new UserHandler();

	public async start() {
		if (!envParseBoolean('GRPC_ENABLED')) return this.destroy();

		await this.members.waitForReady();
		await this.users.waitForReady();
	}

	public destroy() {
		this.members.client.close();
		this.users.client.close();
	}
}
