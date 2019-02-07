import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run({ userID }: { userID: string }) {
		const user = await this.client.users.fetch(userID).catch(() => null);
		if (user) {
			await user.settings.sync();
			return user.settings.toJSON();
		}
		return null;
	}

}
