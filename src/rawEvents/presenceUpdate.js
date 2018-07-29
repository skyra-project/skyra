const { RawEvent } = require('../index');

module.exports = class extends RawEvent {

	constructor(...args) {
		super(...args, { name: 'PRESENCE_UPDATE' });
	}

	process(data) {
		const user = this.client.users.get(data.user.id);
		if (user) user._patch(data.user);
	}

};
