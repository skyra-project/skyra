import { IPCMonitor } from '../../lib/structures/IPCMonitor';

export default class extends IPCMonitor {

	public async run({ userID }: { userID: string }): Promise<any> {
		try {
			const user = await this.client.users.fetch(userID);
			return user.toJSON();
		} catch (error) {
			return null;
		}
	}

}
