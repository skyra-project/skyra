const { RawEvent } = require('../index');

module.exports = class extends RawEvent {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, { name: 'PRESENCE_UPDATE' });
	}

	public process(data) {
		const user = this.client.users.get(data.user.id);
		if (user) user._patch(data.user);
	}

};
