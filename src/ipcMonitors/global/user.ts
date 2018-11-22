import { IPCMonitor, ToJSON } from '../../index';

export default class extends IPCMonitor {

	async run({ userID }) {
		try {
			const user = await this.client.users.fetch(userID);
			return ToJSON.user(user);
		} catch (error) {
			return null;
		}
	}

};
