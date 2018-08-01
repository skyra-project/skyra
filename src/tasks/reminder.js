const { Task, Timestamp } = require('klasa');

module.exports = class extends Task {

	constructor(client, store, file, directory) {
		super(...args);

		this.timestamp = new Timestamp('MMMM d, hh:mm:ss');
	}

	async run(doc) {
		// Fetch the user to send the message to
		const user = await this.client.users.fetch(doc.user).catch(this._catchErrorUser);
		await user.send(`⏲ Hey! You asked me on ${this.timestamp.displayUTC()} to remind you:\n*${doc.content}*`)
			.catch(this._catchErrorMessage);
	}

	_catchErrorUser(error) {
		// 10013: Unknown user
		if (error.code === 10013) return;
		throw error;
	}

	_catchErrorMessage(error) {
		// 50007: Cannot send messages to this user
		if (error.code === 50007) return;
		throw error;
	}

};
