const { API, ToJSON } = require('../../index');

export default class extends API {

	public async run({ userID }) {
		try {
			const user = await this.client.users.fetch(userID);
			return { response: ToJSON.user(user) };
		} catch (error) {
			return null;
		}
	}

}
